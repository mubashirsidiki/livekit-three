import nodemailer from "nodemailer";
import { getSettingsCollection } from "@/lib/db";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function smtpEnabled(): boolean {
  if (process.env.SMTP_ENABLED !== "true") return false;
  if (!process.env.SMTP_USER) return false;
  return true;
}

async function getAlertEmail(): Promise<string> {
  try {
    const col = await getSettingsCollection();
    const row = await col.findOne({ key: "alert_email" });
    if (row?.value) return row.value as string;
  } catch {}
  return process.env.ADMIN_EMAIL || "";
}

async function getEmailTemplate(): Promise<string | null> {
  try {
    const col = await getSettingsCollection();
    const row = await col.findOne({ key: "email_template" });
    if (row?.value) return row.value as string;
  } catch {}
  return null;
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replaceAll(key, val);
  }
  return out;
}

export interface UrgencyAlertData {
  callerName: string;
  callerPhone: string;
  urgency: string;
  reason: string;
  caseType: string;
}

export async function sendUrgencyAlert(data: UrgencyAlertData) {
  if (!smtpEnabled()) {
    console.info("SMTP disabled, skipping urgency alert email");
    return;
  }

  const to = await getAlertEmail();
  if (!to) {
    console.info("No alert email configured, skipping urgency alert");
    return;
  }

  const vars = {
    CALLER_NAME: data.callerName,
    CALLER_PHONE: data.callerPhone,
    URGENCY: data.urgency,
    REASON: data.reason,
    CASE_TYPE: data.caseType,
  };

  const customTemplate = await getEmailTemplate();

  let subject = `[${data.urgency}] Urgent Call Alert - ${data.callerName}`;
  let html: string;

  if (customTemplate) {
    const rendered = renderTemplate(customTemplate, vars);
    const lines = rendered.split("\n");
    const subjectLine = lines[0].replace(/^Subject:\s*/i, "");
    if (subjectLine) subject = subjectLine;
    html = lines.slice(1).join("\n").replace(/\n/g, "<br>");
  } else {
    html = `
      <h2 style="color: red;">Urgent Call Alert</h2>
      <p><strong>Urgency:</strong> ${data.urgency}</p>
      <p><strong>Caller:</strong> ${data.callerName}</p>
      <p><strong>Phone:</strong> ${data.callerPhone}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Case Type:</strong> ${data.caseType}</p>
      <hr />
      <p style="color: #666;">This alert was generated automatically by Lawyer Bot.</p>
    `;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Lawyer Bot" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export interface DailyReportData {
  date: string;
  totalCalls: number;
  callers: { name: string; phone: string; caseType: string }[];
  newEnquiries: number;
  urgentCalls: number;
  existingClientMessages: number;
}

export async function sendDailyReport(data: DailyReportData) {
  if (!smtpEnabled()) {
    console.info("SMTP disabled, skipping daily report email");
    return;
  }

  const to = await getAlertEmail();
  if (!to) return;

  const callerRows = data.callers
    .map((c) => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.caseType}</td></tr>`)
    .join("");

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Lawyer Bot" <${process.env.SMTP_USER}>`,
    to,
    subject: `Daily Call Report - ${data.date}`,
    html: `
      <h2>Daily Call Report — ${data.date}</h2>
      <p><strong>Total Calls:</strong> ${data.totalCalls}</p>
      <p><strong>New Enquiries:</strong> ${data.newEnquiries}</p>
      <p><strong>Existing Client Messages:</strong> ${data.existingClientMessages}</p>
      <p><strong>Urgent Calls:</strong> ${data.urgentCalls}</p>
      <h3>Caller Details</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
        <tr><th>Name</th><th>Phone</th><th>Case Type</th></tr>
        ${callerRows || "<tr><td colspan='3'>No calls today</td></tr>"}
      </table>
      <hr />
      <p style="color: #666;">This report was generated automatically by Lawyer Bot.</p>
    `,
  });
}
