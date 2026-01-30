import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

type PasswordResetParams = {
  to: string;
  name: string;
  temporaryPassword: string;
};

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appName: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new Error('RESEND_API_KEY nao definido');

    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.config.get<string>('MAIL_FROM_EMAIL') ?? 'no-reply@maintenix.com';
    this.fromName = this.config.get<string>('MAIL_FROM_NAME') ?? 'MAINTENIX';
    this.appName = this.config.get<string>('MAIL_APP_NAME') ?? 'MAINTENIX';
  }

  async sendPasswordResetEmail(params: PasswordResetParams) {
    const { to, name, temporaryPassword } = params;
    const subject = `${this.appName} - Nova senha de acesso`;
    const { html, text } = this.buildPasswordResetTemplate({
      name,
      temporaryPassword,
    });

    const { data, error } = await this.resend.emails.send({
      from: this.formatFrom(),
      to,
      subject,
      html,
      text,
    });

    // OU: quando estourar o limite diario da Resend, enviar via provedor alternativo.
    if (error) {
      this.logger.error(`Falha ao enviar email para ${to}: ${error.message}`);
      throw new Error('Falha ao enviar email');
    }

    this.logger.log(`Email de reset enviado para ${to}. Id: ${data?.id ?? 'n/a'}`);
    return { id: data?.id ?? null };
  }

  private formatFrom() {
    return `${this.fromName} <${this.fromEmail}>`;
  }

  private buildPasswordResetTemplate(params: {
    name: string;
    temporaryPassword: string;
  }) {
    const { name, temporaryPassword } = params;
    const preview = `${this.appName} - Nova senha`;

    const text = `Ola ${name},\n\n` +
      `Sua senha foi redefinida. Use a senha temporaria abaixo para acessar e ` +
      `troque assim que entrar:\n\n` +
      `${temporaryPassword}\n\n` +
      `Se voce nao solicitou isso, entre em contato com o suporte.`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${preview}</title>
    <style>
      body { margin: 0; padding: 0; background: #f5f7fb; font-family: "Helvetica Neue", Arial, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 32px 20px; }
      .card { background: #ffffff; border-radius: 16px; padding: 28px; box-shadow: 0 8px 24px rgba(18, 24, 40, 0.08); }
      .brand { font-weight: 700; font-size: 18px; color: #0f172a; letter-spacing: 0.4px; }
      h1 { margin: 16px 0 12px; font-size: 24px; color: #111827; }
      p { margin: 0 0 16px; color: #374151; line-height: 1.6; }
      .password { background: #0f172a; color: #ffffff; font-size: 20px; letter-spacing: 1px; padding: 14px 18px; border-radius: 12px; display: inline-block; }
      .hint { font-size: 13px; color: #6b7280; margin-top: 18px; }
      .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
      .footer { font-size: 12px; color: #9ca3af; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="brand">${this.appName}</div>
        <h1>Nova senha de acesso</h1>
        <p>Ola ${name}, sua senha foi redefinida com sucesso.</p>
        <p>Use a senha temporaria abaixo para acessar e altere assim que entrar:</p>
        <div class="password">${temporaryPassword}</div>
        <div class="divider"></div>
        <p class="hint">Se voce nao solicitou esta redefinicao, entre em contato com o suporte.</p>
      </div>
      <div class="footer">${this.appName} · Email automatico</div>
    </div>
  </body>
</html>`;

    return { html, text };
  }
}
