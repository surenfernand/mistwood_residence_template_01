import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Canonical Mistwood transactional email frame (matches guest enquiry design). */
export const EMAIL = {
  width: 700,
  outerBg: "#f2f0eb",
  innerBg: "#fffaf5",
  bodyPad: "22px 38px 32px",
  bodyPadMobile: "12px 18px 24px",
  outerPad: "18px 8px",
  accent: "#a47d25",
  heading: "#103e2b",
  body: "#1a2822",
  fontSans: "Arial,Helvetica,sans-serif",
  fontSerif: "Georgia,'Times New Roman',serif",
};

export const brandAssetRoot = path.join(
  projectRoot,
  "server",
  "email-assets",
  "mistwood_customer_confirmation_email",
  "assets",
);

/** Browser previews under /dev/email-templates */
export const brandAssetWebBase = "../mistwood_customer_confirmation_email/assets";

export function brandHeaderAttachment(cid) {
  return { filename: "header.jpg", path: path.join(brandAssetRoot, "header.jpg"), cid };
}

export function brandFooterAttachment(cid) {
  return { filename: "footer.jpg", path: path.join(brandAssetRoot, "footer.jpg"), cid };
}

export function goldRule(margin = "0 auto 24px") {
  return `<div style="width:80px;height:3px;background:${EMAIL.accent};margin:${margin}"></div>`;
}

export function heroIcon(innerHtml) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:4px 0 0">
<div style="width:66px;height:66px;border-radius:50%;background:#e3ecdc;text-align:center;line-height:66px">${innerHtml}</div></td></tr></table>`;
}

/**
 * @param {{ title: string, bodyHtml: string, headerCid: string, footerCid: string, extraHead?: string }} opts
 */
export function emailDocument({ title, bodyHtml, headerCid, footerCid, extraHead = "" }) {
  const w = EMAIL.width;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>@media only screen and (max-width:600px){.email-body-pad{padding:${EMAIL.bodyPadMobile}!important}h1.hero-title{font-size:27px!important}}</style>${extraHead}</head>
<body style="margin:0;padding:0;background:${EMAIL.outerBg};font-family:${EMAIL.fontSans};color:${EMAIL.body}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${EMAIL.outerBg}">
<tr><td align="center" style="padding:${EMAIL.outerPad}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${w}" style="width:100%;max-width:${w}px;background:${EMAIL.innerBg}">
<tr><td style="line-height:0"><img src="cid:${headerCid}" alt="Mistwood Residence, Nuwara Eliya" width="${w}" style="width:100%;height:auto;display:block;border:0"></td></tr>
<tr><td class="email-body-pad" style="padding:${EMAIL.bodyPad}">${bodyHtml}</td></tr>
<tr><td style="line-height:0"><img src="cid:${footerCid}" alt="Mistwood Residence footer" width="${w}" style="width:100%;height:auto;display:block;border:0"></td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Static HTML previews (placeholders / sample data) — same shell, file-based images.
 */
export function emailDocumentPreview({ title, bodyHtml, extraHead = "" }) {
  const w = EMAIL.width;
  const header = `${brandAssetWebBase}/header.jpg`;
  const footer = `${brandAssetWebBase}/footer.jpg`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<link rel="stylesheet" href="styles.css" />
<style>@media only screen and (max-width:600px){.email-body-pad{padding:${EMAIL.bodyPadMobile}!important}h1.hero-title{font-size:27px!important}}</style>${extraHead}</head>
<body style="margin:0;padding:0;background:${EMAIL.outerBg};font-family:${EMAIL.fontSans};color:${EMAIL.body}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${EMAIL.outerBg}">
<tr><td align="center" style="padding:${EMAIL.outerPad}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${w}" class="email" style="width:100%;max-width:${w}px;background:${EMAIL.innerBg}">
<tr><td style="line-height:0"><img src="${header}" alt="Mistwood Residence, Nuwara Eliya" width="${w}" style="width:100%;height:auto;display:block;border:0"></td></tr>
<tr><td class="email-body-pad body-pad" style="padding:${EMAIL.bodyPad}">${bodyHtml}</td></tr>
<tr><td style="line-height:0"><img src="${footer}" alt="Mistwood Residence footer" width="${w}" style="width:100%;height:auto;display:block;border:0"></td></tr>
</table></td></tr></table></body></html>`;
}
