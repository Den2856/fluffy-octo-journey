import type { Request, Response } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OrderModel } from "../models/order.model";

type AuthedReq = Request & { user?: { _id: string; role?: string } };

function genRef() {
  const rnd = crypto.randomBytes(2).toString("hex").toUpperCase();
  const d = new Date();
  const y = d.getFullYear();
  return `OPT-${y}-${rnd}`;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: (process.env.SMTP_SECURE ?? "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendFeedback(req: AuthedReq, res: Response): Promise<void> {
  try {
    const { name, email, vehicleId, subject, message } = req.body ?? {};

    if (!name || !email || !vehicleId || !message) {
      res.status(400).json({ success: false, message: "Missing fields" });
      return;
    }

    const to = process.env.FEEDBACK_TO || process.env.SMTP_USER;
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from,
      to,
      subject: subject?.trim() ? `OPT-Rent: ${subject}` : "OPT-Rent: Feedback",
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `VehicleId: ${vehicleId}`,
        "",
        message,
      ].join("\n"),
    });

    const ref = genRef();
    console.log("Generated ref:", ref);

    const order = await OrderModel.create({
      ref: ref,
      customer: String(name),
      customerEmail: String(email),
      createdBy: req.user?._id ?? null,
      requestedVehicle: vehicleId,
      status: "pending",
      subject: subject ?? "",
      message: message ?? "",
      date: new Date().toISOString(),
    });

    res.json({ success: true, data: { order, ref } });
  } catch (err: any) {
    console.error("sendFeedback error:", err);
    res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
}
