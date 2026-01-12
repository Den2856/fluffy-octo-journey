import type Mail from "nodemailer/lib/mailer";
import type { Buffer } from "node:buffer";

type Vehicle = {
  _id: string;
  title?: string;
  brand?: string;
  model?: string;
  type?: string;
  seats?: number;
  pricePerDay?: number;
  images?: string[];
};

type Input = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  vehicle: Vehicle | null;
  vehicleImageBuffer?: Buffer;
  vehicleImageMime?: string;
};

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pickFilenameByMime(mime?: string) {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "vehicle.png";
  if (m.includes("webp")) return "vehicle.webp";
  if (m.includes("gif")) return "vehicle.gif";
  if (m.includes("svg")) return "vehicle.svg";
  return "vehicle.jpg";
}

export function buildFeedbackEmail(input: Input): { html: string; attachments: Mail.Attachment[] } {
  const v = input.vehicle;

  const carName =
    v?.title ||
    [v?.brand, v?.model].filter(Boolean).join(" ") ||
    "Selected vehicle";

  const badge =
    v?.type === "SUV"
      ? "SUV / Family"
      : v?.type === "Sport"
        ? "Sport / Performance"
        : v?.type
          ? v.type
          : "Vehicle";

  const hasInline = Boolean(input.vehicleImageBuffer);
  const fallbackUrl = v?.images?.[0];

  const imageBlock = hasInline
    ? `
      <tr>
        <td style="padding:0 20px 22px 20px;">
          <img
            src="cid:vehicle_image"
            width="600"
            style="display:block;width:100%;max-width:600px;border:1px solid rgba(255,255,255,.08);border-radius:12px;"
            alt="Vehicle"
          />
        </td>
      </tr>
    `
    : fallbackUrl
      ? `
      <tr>
        <td style="padding:0 20px 22px 20px;">
          <img
            src="${esc(fallbackUrl)}"
            width="600"
            style="display:block;width:100%;max-width:600px;border:1px solid rgba(255,255,255,.08);border-radius:12px;"
            alt="Vehicle"
          />
        </td>
      </tr>
    `
      : "";

  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f16;padding:24px;font-family:Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#121826;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:18px 20px;color:#fff;">
              <div style="font-size:18px;font-weight:700;">
                <span style="color:#f97316;">—</span> New Query
              </div>
              <div style="margin-top:6px;color:rgba(255,255,255,.75);font-size:13px;">
                From: ${esc(input.name)} · ${esc(input.email)}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 20px 16px 20px;">
              <div style="display:inline-block;background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.35);color:#ffd6b0;
                          font-size:12px;padding:6px 10px;border-radius:999px;">
                ${esc(badge)}
              </div>
              <div style="margin-top:10px;color:#fff;font-size:22px;font-weight:700;">
                ${esc(carName)}
              </div>
              ${typeof v?.seats === "number" ? `<div style="margin-top:6px;color:rgba(255,255,255,.75);font-size:13px;">Seats: ${v.seats}</div>` : ""}
              ${typeof v?.pricePerDay === "number" ? `<div style="margin-top:2px;color:rgba(255,255,255,.75);font-size:13px;">Price/day: $${v.pricePerDay}</div>` : ""}
            </td>
          </tr>

          <tr>
            <td style="padding:0 20px 18px 20px;">
              <div style="border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);padding:14px;border-radius:12px;">
                <div style="color:rgba(255,255,255,.8);font-size:12px;text-transform:uppercase;letter-spacing:.12em;">
                  Subject
                </div>
                <div style="margin-top:6px;color:#fff;font-size:14px;">
                  ${esc(input.subject?.trim() || "(no subject)")}
                </div>

                <div style="margin-top:14px;color:rgba(255,255,255,.8);font-size:12px;text-transform:uppercase;letter-spacing:.12em;">
                  Message
                </div>
                <div style="margin-top:6px;color:#fff;font-size:14px;line-height:1.55;white-space:pre-wrap;">
                  ${esc(input.message)}
                </div>
              </div>
            </td>
          </tr>

          ${imageBlock}

          <tr>
            <td style="padding:16px 20px;color:rgba(255,255,255,.55);font-size:12px;border-top:1px solid rgba(255,255,255,.08);">
              Sent from your website feedback form.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;

  const attachments: Mail.Attachment[] = input.vehicleImageBuffer
    ? [
        {
          filename: pickFilenameByMime(input.vehicleImageMime),
          content: input.vehicleImageBuffer,
          contentType: input.vehicleImageMime || "image/jpeg",
          cid: "vehicle_image",
          contentDisposition: "inline" as const,
        },
      ]
    : [];

  return { html, attachments };
}
