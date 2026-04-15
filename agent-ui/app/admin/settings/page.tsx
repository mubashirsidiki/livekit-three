"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [firmName, setFirmName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [instructions, setInstructions] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFirmName(data.firm_name || "");
      setPhoneNumber(data.phone_number || "");
      setBusinessHours(data.business_hours || "");
      setInstructions(data.instructions || "");
      setAlertEmail(data.alert_email || "");
      setEmailTemplate(data.email_template || `Subject: [URGENCY] Urgent Call Alert - CALLER_NAME

Urgent Call Alert

Urgency: URGENCY
Caller: CALLER_NAME
Phone: CALLER_PHONE
Reason: REASON
Case Type: CASE_TYPE

---
This alert was generated automatically by Lawyer Bot.`);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload: Record<string, string> = {
        firm_name: firmName,
        phone_number: phoneNumber,
        business_hours: businessHours,
        alert_email: alertEmail,
        email_template: emailTemplate,
      };
      if (instructions.trim()) payload.instructions = instructions;

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Settings saved successfully. Prompt pushed to agent.");
      } else {
        setMessage(data.error || "Failed to save settings");
      }
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-[var(--color-muted-foreground)]">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Settings</h1>

      {/* Business Info */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="font-semibold text-[var(--color-foreground)]">Business Information</h2>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Firm Name</label>
          <input
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Business Hours</label>
          <input
            type="text"
            value={businessHours}
            onChange={(e) => setBusinessHours(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)]"
            placeholder="e.g. Mon-Fri 9:00 AM - 6:00 PM"
          />
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="font-semibold text-[var(--color-foreground)]">Agent Prompt</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Edit the AI assistant&apos;s system prompt. Changes will be pushed to the agent in real-time (if running) and saved for next startup.
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={16}
          className="block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-xs font-mono text-[var(--color-foreground)]"
        />
      </div>

      {/* Email Notifications */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-foreground)]">Email Notifications</h2>
          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            SMTP Disabled
          </span>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Configure where urgent call alerts are sent and customize the email template. Enable SMTP in env vars to activate.
        </p>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Alert Recipient Email</label>
          <input
            type="email"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)]"
            placeholder="e.g. admin@sterlinglaw.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)]">Email Template</label>
          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            Available placeholders: <code className="rounded bg-[var(--color-accent)] px-1">CALLER_NAME</code> <code className="rounded bg-[var(--color-accent)] px-1">CALLER_PHONE</code> <code className="rounded bg-[var(--color-accent)] px-1">URGENCY</code> <code className="rounded bg-[var(--color-accent)] px-1">REASON</code> <code className="rounded bg-[var(--color-accent)] px-1">CASE_TYPE</code>
          </p>
          <textarea
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            rows={14}
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-xs font-mono text-[var(--color-foreground)]"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Push to Agent"}
        </button>
        {message && (
          <span className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
