import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "LaLa Match <noreply@lalamatch.org>";
const ADMIN_NOTIFY_EMAILS = ["paloma.flores@somoslala.org", "analidia.schroeder@somoslala.org"];

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendCompanyRegistrationNotification({
  companyName,
  contactName,
  companyDescription,
  website,
  linkedinUrl,
}: {
  companyName: string;
  contactName: string;
  companyDescription: string | null;
  website: string | null;
  linkedinUrl: string | null;
}) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_NOTIFY_EMAILS,
    subject: `New company registered on LaLa Match: ${companyName}`,
    html: `
      <h2>A new company has registered on LaLa Match</h2>
      <p><strong>Company:</strong> ${companyName}</p>
      <p><strong>Contact person:</strong> ${contactName}</p>
      ${companyDescription ? `<p><strong>Description:</strong> ${companyDescription}</p>` : ""}
      ${website ? `<p><strong>Website:</strong> <a href="${website}">${website}</a></p>` : ""}
      ${linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${linkedinUrl}">${linkedinUrl}</a></p>` : ""}
      <p>Go to the <a href="https://lalamatch.org/admin">admin portal</a> to review and approve this company.</p>
    `,
  });
}

export async function sendCompanyApprovalEmail({
  toEmail,
  companyName,
}: {
  toEmail: string;
  companyName: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: "Your LaLa Match account has been approved / Sua conta foi aprovada / Tu cuenta fue aprobada",
    html: `
      <h2>Welcome to LaLa Match, ${companyName}!</h2>
      <p>Your company account has been reviewed and approved by the LALA team.</p>
      <p>You can now log in and start posting positions to connect with LaLideres.</p>
      <p><a href="https://lalamatch.org/dashboard">Go to your dashboard →</a></p>
      <p>The LALA Team</p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <h2>Bem-vindo ao LaLa Match, ${companyName}!</h2>
      <p>Sua conta empresarial foi revisada e aprovada pela equipe da LALA.</p>
      <p>Agora você pode entrar e começar a publicar vagas para se conectar com LaLideres.</p>
      <p><a href="https://lalamatch.org/dashboard">Ir para o seu painel →</a></p>
      <p>A Equipe LALA</p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <h2>¡Bienvenido a LaLa Match, ${companyName}!</h2>
      <p>Tu cuenta empresarial ha sido revisada y aprobada por el equipo de LALA.</p>
      <p>Ya puedes iniciar sesión y comenzar a publicar posiciones para conectarte con LaLideres.</p>
      <p><a href="https://lalamatch.org/dashboard">Ir a tu panel →</a></p>
      <p>El Equipo LALA</p>
    `,
  });
}
