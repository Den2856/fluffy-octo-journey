import type { Response } from "express";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { Buffer } from "node:buffer";
import crypto from "crypto";
import { mailer } from "../lib/mailer";
import { buildFeedbackEmail } from "../templates/feedbackEmail";
import { CarModel } from "../models/car.model";
import { OrderModel } from "../models/order.model";
import type { AuthedRequest } from "../middleware/auth";

type FeedbackBody = {
  name: string;
  email: string;
  vehicleId: string;
  subject?: string;
  message: string;
};

function toAssetUrl(maybePathOrUrl: string) {
  if (!maybePathOrUrl) return "";
  if (maybePathOrUrl.startsWith("http://") || maybePathOrUrl.startsWith("https://")) return maybePathOrUrl;

  const origin = (process.env.ASSETS_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173").trim();
  const o = origin.replace(/\/$/, "");
  const p = "/" + maybePathOrUrl.replace(/^\//, "");
  return `${o}${p}`;
}

async function fetchToBuffer(urlStr: string, redirectLeft = 5): Promise<{ buffer: Buffer; mime: string }> {
  return await new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;

    const req = lib.request(
      {
        method: "GET",
        hostname: u.hostname,
        port: u.port ? Number(u.port) : u.protocol === "https:" ? 443 : 80,
        path: u.pathname + u.search,
        headers: { "User-Agent": "optrent-mailer" },
      },
      (res) => {
        const code = res.statusCode || 0;

        if ([301, 302, 303, 307, 308].includes(code) && res.headers.location && redirectLeft > 0) {
          const next = new URL(res.headers.location, urlStr).toString();
          res.resume();
          fetchToBuffer(next, redirectLeft - 1).then(resolve).catch(reject);
          return;
        }

        if (code < 200 || code >= 300) {
          res.resume();
          reject(new Error(`Failed to fetch asset: ${urlStr} (status ${code})`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on("end", () => {
          const mime = String(res.headers["content-type"] || "application/octet-stream").split(";")[0];
          resolve({ buffer: Buffer.concat(chunks), mime });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function genRef() {
  const rnd = crypto.randomBytes(2).toString("hex").toUpperCase();
  const d = new Date();
  const y = d.getFullYear();
  return `OPT-${y}-${rnd}`;
}

export async function postFeedback(req: AuthedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Auth required" });
      return;
    }

    const body = (req.body || {}) as FeedbackBody;

    const name = (body.name?.trim() || req.user.name || "").trim();
    const email = (body.email?.trim() || req.user.email || "").trim();
    const vehicleId = (body.vehicleId || "").trim();
    const subject = body.subject?.trim() || "";
    const message = body.message?.trim() || "";

    if (!name || !email || !vehicleId || !message) {
      res.status(400).send("Missing required fields");
      return;
    }

    const car = await CarModel.findById(vehicleId).lean().exec();
    if (!car) {
      res.status(404).send("Car not found");
      return;
    }

    const title = [ (car as any).title, (car as any).make, (car as any).brand, (car as any).model ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const images = [
      (car as any).thumbnailUrl ? toAssetUrl((car as any).thumbnailUrl) : "",
      ...(Array.isArray((car as any).images) ? (car as any).images.map((x: string) => toAssetUrl(x)) : []),
    ].filter(Boolean);

    let vehicleImageBuffer: Buffer | undefined;
    let vehicleImageMime: string | undefined;

    if (images[0]) {
      try {
        const { buffer, mime } = await fetchToBuffer(images[0]);
        vehicleImageBuffer = buffer;
        vehicleImageMime = mime;
      } catch {

      }
    }


    const built = buildFeedbackEmail({
      name,
      email,
      subject,
      message,
      vehicle: {
        _id: String((car as any)._id),
        title: title || undefined,
        brand: (car as any).make || (car as any).brand,
        model: (car as any).model,
        type: (car as any).type,
        seats: (car as any).seats,
        pricePerDay: (car as any).pricePerDay,
        images,
      },
      vehicleImageBuffer,
      vehicleImageMime,
    });

    const to = (process.env.TO_EMAIL || process.env.FEEDBACK_TO || "").trim();
    if (!to) return void res.status(500).send("TO_EMAIL is missing");

    const fromBase = (process.env.FROM_EMAIL || process.env.SMTP_USER || "").trim();
    if (!fromBase) return void res.status(500).send("FROM_EMAIL/SMTP_USER is missing");

    await (mailer as any).sendMail({
      from: `"OpRent" <${fromBase}>`,
      to,
      replyTo: email,
      subject: subject ? `Website query: ${subject}` : `Website query: ${title || vehicleId}`,
      html: built.html,
      attachments: built.attachments,
    });

    const order = await OrderModel.create({
      ref: genRef(),
      customer: name,
      customerEmail: email,
      createdBy: req.user.id,
      requestedVehicle: vehicleId,
      status: "pending",
      subject,
      message,
      bookingStartAt: null,
      bookingEndAt: null,
      bookingUpdatedBy: null,
    });

    res.status(201).json({
      success: true,
      data: { orderId: String(order._id), ref: order.ref },
    });
  } catch (e: any) {
    console.error("FEEDBACK ERROR:", e);
    res.status(500).send(e?.message || "Server error");
  }
}
