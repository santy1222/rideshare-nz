// Envío de emails transaccionales vía Resend (https://resend.com).
// Si RESEND_API_KEY no está configurada, no envía y solo lo registra en el log
// (así dev local y producción funcionan aunque falte la key).

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendEmail(to: string, subject: string, bodyHtml: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "RideShare NZ <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY no configurada, email omitido: "${subject}" → ${to}`);
    return;
  }

  const html = `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1D9E75; margin-bottom: 16px;">RideShare NZ</h2>
      ${bodyHtml}
      <p style="margin-top: 24px;">
        <a href="https://www.rideshare-nz.com" style="background: #1D9E75; color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">Open RideShare</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">You received this email because you have an account on rideshare-nz.com</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) console.error(`[email] Falló el envío (${res.status}):`, await res.text());
  } catch (err) {
    console.error("[email] Error de red al enviar:", err);
  }
}
