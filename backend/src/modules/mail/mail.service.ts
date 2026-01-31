import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

type PasswordResetParams = {
  to: string;
  name: string;
  temporaryPassword: string;
};

type MaintenanceAssignmentParams = {
  to: string;
  name: string;
  machineName: string;
  priority: string;
  category: string;
  shift: string;
  problemDescription: string;
  actionUrl: string;
};

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appName: string;
  private readonly appUrl: string;
  private readonly templateDir: string;
  private readonly templateCache = new Map<string, string>();

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new Error('RESEND_API_KEY nao definido');

    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.config.get<string>('MAIL_FROM_EMAIL') ?? 'no-reply@maintenix.com';
    this.fromName =
      this.config.get<string>('MAIL_FROM_NAME') ?? 'Manutenção-Max';
    this.appName = this.config.get<string>('MAIL_APP_NAME') ?? 'Manutenção-Max';
    this.appUrl =
      this.config.get<string>('MAIL_APP_URL') ?? 'http://localhost:5173';
    this.templateDir =
      this.config.get<string>('MAIL_TEMPLATE_DIR') ??
      join(process.cwd(), 'src', 'modules', 'mail', 'templates');
  }

  async sendPasswordResetEmail(params: PasswordResetParams) {
    const { to, name, temporaryPassword } = params;
    const subject = `${this.appName} - Nova senha de acesso`;
    const html = await this.renderTemplate('password-reset.html', {
      name,
      temporaryPassword,
    });

    const { data, error } = await this.resend.emails.send({
      from: this.formatFrom(),
      to,
      subject,
      html,
    });

    // OU: quando estourar o limite diario da Resend, enviar via provedor alternativo.
    if (error) {
      this.logger.error(`Falha ao enviar email para ${to}: ${error.message}`);
      throw new Error('Falha ao enviar email');
    }

    this.logger.log(
      `Email de reset enviado para ${to}. Id: ${data?.id ?? 'n/a'}`,
    );
    return { id: data?.id ?? null };
  }

  async sendMaintenanceAssignmentEmail(params: MaintenanceAssignmentParams) {
    const {
      to,
      name,
      machineName,
      priority,
      category,
      shift,
      problemDescription,
      actionUrl,
    } = params;

    const subject = `${this.appName} - Nova manutenção atribuída`;
    const html = await this.renderTemplate('maintenance-assignment.html', {
      name,
      machineName,
      priority,
      category,
      shift,
      problemDescription,
      actionUrl,
    });

    const { data, error } = await this.resend.emails.send({
      from: this.formatFrom(),
      to,
      subject,
      html,
    });

    // OU: quando estourar o limite diario da Resend, enviar via provedor alternativo.
    if (error) {
      this.logger.error(
        `Falha ao enviar email de manutenção para ${to}: ${error.message}`,
      );
      throw new Error('Falha ao enviar email');
    }

    this.logger.log(
      `Email de manutenção enviado para ${to}. Id: ${data?.id ?? 'n/a'}`,
    );
    return { id: data?.id ?? null };
  }

  private formatFrom() {
    return `${this.fromName} <${this.fromEmail}>`;
  }

  private async renderTemplate(
    filename: string,
    params: Record<string, string>,
  ) {
    const source = await this.loadTemplate(filename);
    return Object.entries({
      appName: this.appName,
      appUrl: this.appUrl,
      ...params,
    }).reduce(
      (content, [key, value]) => content.replaceAll(`{{${key}}}`, value),
      source,
    );
  }

  private async loadTemplate(filename: string) {
    const cached = this.templateCache.get(filename);
    if (cached) return cached;

    const filePath = join(this.templateDir, filename);
    const content = await readFile(filePath, 'utf8');
    this.templateCache.set(filename, content);
    return content;
  }
}
