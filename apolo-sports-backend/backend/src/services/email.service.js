const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
}

// Plantilla base: envoltorio con la marca de Apolo Sports. Los estilos van en línea
// (inline) a propósito — la mayoría de clientes de correo (Gmail incluido) ignoran
// o recortan las etiquetas <style> en el <head>.
function emailLayout({ preheader = "", bodyHtml, ctaText, ctaUrl }) {
  return `
  <div style="background-color:#F4F7FB; padding:32px 16px; font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden;">${preheader}</div>
    <table role="presentation" width="100%" style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #E4E9F2;">
      <tr>
        <td style="background-color:#0A1830; padding:28px 32px; text-align:center;">
          <span style="font-family:Arial,Helvetica,sans-serif; font-weight:800; font-size:22px; letter-spacing:1px; color:#ffffff;">
            APOLO <span style="color:#4FA0FF;">SPORTS</span>
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px; color:#16233F; font-size:15px; line-height:1.6;">
          ${bodyHtml}
          ${ctaUrl ? `
          <table role="presentation" style="margin:28px 0 8px;">
            <tr>
              <td style="border-radius:999px; background-color:#1E7FE8;">
                <a href="${ctaUrl}" style="display:inline-block; padding:13px 28px; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; border-radius:999px;">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
          <p style="font-size:12px; color:#5B6B85; word-break:break-all;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
            <a href="${ctaUrl}" style="color:#1E7FE8;">${ctaUrl}</a>
          </p>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px; background-color:#F4F7FB; text-align:center; font-size:12px; color:#5B6B85;">
          © ${new Date().getFullYear()} Apolo Sports · Rendimiento, estilo y actitud en cada movimiento.
        </td>
      </tr>
    </table>
  </div>`;
}

async function sendMail({ to, subject, html }) {
  // Si no hay credenciales SMTP configuradas (ej. en desarrollo local sin cuenta de correo),
  // no truena la app — solo lo deja registrado en consola para poder seguir probando el flujo.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("[email] SMTP no configurado. Email simulado:", { to, subject });
    return { simulated: true };
  }

  const transporter = getTransporter();
  return transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const html = emailLayout({
    preheader: "Restablece tu contraseña de Apolo Sports",
    bodyHtml: `
      <h2 style="margin:0 0 12px; font-size:20px; color:#0A1830;">Recupera tu contraseña</h2>
      <p style="margin:0 0 4px;">Recibimos una solicitud para restablecer tu contraseña.</p>
      <p style="margin:0; color:#5B6B85; font-size:13px;">Este enlace vence en 30 minutos. Si no fuiste tú, puedes ignorar este correo con tranquilidad.</p>
    `,
    ctaText: "Crear nueva contraseña",
    ctaUrl: resetUrl,
  });

  return sendMail({ to, subject: "Recupera tu contraseña — Apolo Sports", html });
}

async function sendOrderConfirmationEmail({ to, order }) {
  const formatPrice = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  const itemsHtml = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #E4E9F2;">
          <span style="font-weight:bold; color:#0A1830;">${i.product_name}</span><br/>
          <span style="font-size:13px; color:#5B6B85;">Talla ${i.size} · ${i.color} · x${i.quantity}</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #E4E9F2; text-align:right; font-weight:bold; color:#0A1830;">
          ${formatPrice(i.unit_price * i.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const bodyHtml = `
    <h2 style="margin:0 0 4px; font-size:20px; color:#0A1830;">¡Gracias por tu compra!</h2>
    <p style="margin:0 0 20px; color:#5B6B85;">Tu pedido <strong style="color:#0A1830;">${order.order_number}</strong> fue confirmado.</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      ${itemsHtml}
      <tr>
        <td style="padding:14px 0 0; font-weight:bold; color:#0A1830;">Total</td>
        <td style="padding:14px 0 0; text-align:right; font-weight:bold; color:#0A1830; font-size:16px;">${formatPrice(order.total)}</td>
      </tr>
    </table>
    <p style="margin:20px 0 0; color:#5B6B85; font-size:13px;">Te avisaremos por aquí mismo cuando tu pedido sea despachado.</p>
  `;

  const html = emailLayout({ preheader: `Confirmación de tu pedido ${order.order_number}`, bodyHtml });
  return sendMail({ to, subject: `Confirmación de tu pedido ${order.order_number} — Apolo Sports`, html });
}

async function sendOrderStatusUpdateEmail({ to, order, status }) {
  const STATUS_LABELS = {
    processing: "está en preparación",
    shipped: "fue enviado",
    delivered: "fue entregado",
    cancelled: "fue cancelado",
    refunded: "fue reembolsado",
  };
  const statusText = STATUS_LABELS[status] || `cambió a "${status}"`;

  const bodyHtml = `
    <h2 style="margin:0 0 12px; font-size:20px; color:#0A1830;">Actualización de tu pedido</h2>
    <p style="margin:0;">Tu pedido <strong style="color:#0A1830;">${order.order_number}</strong> ${statusText}.</p>
  `;
  const html = emailLayout({ preheader: `Tu pedido ${order.order_number} ${statusText}`, bodyHtml });

  return sendMail({ to, subject: `Tu pedido ${order.order_number} ${statusText} — Apolo Sports`, html });
}

module.exports = { sendMail, sendPasswordResetEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail };