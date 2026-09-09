import { Injectable, Logger } from '@nestjs/common';

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  async sendApplicationConfirmation(to: string, jobTitle: string): Promise<void> {
    await this.send({
      to,
      subject: `Đã nhận hồ sơ ứng tuyển: ${jobTitle}`,
      text: `Hồ sơ của bạn cho tin "${jobTitle}" đã được hệ thống tiếp nhận.`,
    });
  }

  async sendApplicationStatusChanged(
    to: string,
    jobTitle: string,
    status: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: `Cập nhật hồ sơ ứng tuyển: ${jobTitle}`,
      text: `Trạng thái hồ sơ cho tin "${jobTitle}" đã chuyển thành ${status}.`,
    });
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/vi/candidate/auth/reset-password?email=${encodeURIComponent(to)}&token=${encodeURIComponent(token)}`;
    await this.send({
      to,
      subject: 'Đặt lại mật khẩu JobPortal',
      text: `Mở liên kết sau để đặt lại mật khẩu (liên kết hết hạn sau 15 phút): ${resetUrl}`,
    });
  }

  private async send(message: EmailMessage): Promise<void> {
    const webhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();
    if (!webhookUrl) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.EMAIL_WEBHOOK_SECRET
            ? { authorization: `Bearer ${process.env.EMAIL_WEBHOOK_SECRET}` }
            : {}),
        },
        body: JSON.stringify(message),
        signal: controller.signal,
      });
      if (!response.ok) {
        this.logger.warn(`Email provider trả về HTTP ${response.status}.`);
      }
    } catch (error) {
      this.logger.warn(`Không thể gửi email qua provider: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
