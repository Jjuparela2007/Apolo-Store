const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
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
  return sendMail({
    to,
    subject: "Recupera tu contraseña — Apolo Sports",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${resetUrl}">Haz clic aquí para crear una nueva contraseña</a></p>
      <p>Este enlace vence en 30 minutos. Si no fuiste tú, puedes ignorar este correo.</p>
    `,
  });
}

async function sendOrderConfirmationEmail({ to, order }) {
  const itemsHtml = order.items
    .map((i) => `<li>${i.quantity} x ${i.product_name} (talla ${i.size}, ${i.color}) — $${i.unit_price}</li>`)
    .join("");

  return sendMail({
    to,
    subject: `Confirmación de tu pedido ${order.order_number} — Apolo Sports`,
    html: `
      <p>¡Gracias por tu compra! Tu pedido <strong>${order.order_number}</strong> fue confirmado.</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total: $${order.total}</strong></p>
      <p>Te avisaremos cuando tu pedido sea despachado.</p>
    `,
  });
}

module.exports = { sendMail, sendPasswordResetEmail, sendOrderConfirmationEmail };
