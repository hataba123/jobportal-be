import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationService } from '../email/email-notification.service';

/** Scheduler nhẹ, dùng advisory lock để chỉ một instance xử lý mỗi batch. */
@Injectable()
export class BackgroundProcessingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackgroundProcessingService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly prisma: PrismaService, private readonly email: EmailNotificationService) {}

  onModuleInit() {
    if (process.env.BACKGROUND_JOBS_ENABLED === 'false' || process.env.NODE_ENV === 'test') return;
    this.timer = setInterval(() => void this.runCycle(), 15_000);
    void this.runCycle();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async runCycle() {
    if (this.running) return;
    this.running = true;
    try {
      const locked = await this.prisma.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_lock(hashtext('jobportal-background')) AS locked`;
      if (!locked[0]?.locked) return;
      try {
        await this.processOutbox();
        await this.expireJobsAndPayments();
        await this.queueInterviewReminders();
        await this.queueNewsletter();
      } finally {
        await this.prisma.$queryRaw`SELECT pg_advisory_unlock(hashtext('jobportal-background'))`;
      }
    } catch (error) {
      this.logger.error(`Background cycle thất bại: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.running = false;
    }
  }

  private async processOutbox() {
    const now = new Date();
    const messages = await this.prisma.outboxMessage.findMany({ where: { processedAt: null, deadLetteredAt: null, attempts: { lt: 10 }, OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] }, orderBy: { occurredAt: 'asc' }, take: 50 });
    for (const message of messages) {
      const claim = await this.prisma.outboxMessage.updateMany({ where: { id: message.id, processedAt: null, deadLetteredAt: null, attempts: message.attempts }, data: { attempts: { increment: 1 } } });
      if (claim.count !== 1) continue;
      try {
        await this.handleMessage(message.type, message.id, message.payload as any);
        await this.prisma.outboxMessage.update({ where: { id: message.id }, data: { processedAt: new Date(), lastError: null } });
        this.logger.log(`Outbox processed message=${message.id} type=${message.type}`);
      } catch (error) {
        const attempts = message.attempts + 1;
        await this.prisma.outboxMessage.update({ where: { id: message.id }, data: { lastError: String(error).slice(0, 2000), nextAttemptAt: attempts >= 10 ? null : new Date(Date.now() + Math.min(3_600_000, 5_000 * 2 ** attempts)), deadLetteredAt: attempts >= 10 ? new Date() : null } });
        this.logger.warn(`Outbox retry=${attempts} message=${message.id}`);
      }
    }
  }

  private async handleMessage(type: string, sourceMessageId: string, payload: any) {
    const notify = async (userId: string, message: string, notificationType: string) => {
      await this.prisma.notification.upsert({ where: { sourceMessageId_userId: { sourceMessageId, userId } }, create: { userId, message, type: notificationType, sourceMessageId, read: false }, update: {} });
    };
    if (type === 'application.created.notification') {
      await notify(payload.employerId, `Có ứng viên mới cho tin "${payload.jobTitle}".`, 'application_created');
      await notify(payload.candidateId, `Đã nhận hồ sơ ứng tuyển cho tin "${payload.jobTitle}".`, 'application_confirmation');
      if (payload.candidateEmail) await this.email.sendApplicationConfirmation(payload.candidateEmail, payload.jobTitle);
    } else if (type === 'application.status.changed') {
      await notify(payload.candidateId, `Trạng thái hồ sơ cho tin "${payload.jobTitle}" đã chuyển thành ${payload.toStatus}.`, 'application_status_changed');
      if (payload.candidateEmail) await this.email.sendApplicationStatusChanged(payload.candidateEmail, payload.jobTitle, payload.toStatus);
    } else if (type === 'interview.scheduled') {
      await notify(payload.candidateId, `Bạn có lịch phỏng vấn cho tin "${payload.jobTitle}".`, 'interview_scheduled');
      if (payload.candidateEmail) await this.email.sendInterviewInvitation(payload.candidateEmail, payload.jobTitle, new Date(payload.startAt), payload.meetingUrl, payload.location);
    } else if (type === 'interview.reminder') {
      await notify(payload.candidateId, `Nhắc lịch phỏng vấn cho tin "${payload.jobTitle}".`, 'interview_reminder');
      if (payload.candidateEmail) await this.email.sendInterviewReminder(payload.candidateEmail, payload.jobTitle, new Date(payload.startAt), payload.meetingUrl);
    } else if (type === 'newsletter.send') {
      await this.email.sendNewsletter(payload.email, payload.titles ?? payload.Titles ?? []);
    }
  }

  private async expireJobsAndPayments() {
    const now = new Date();
    await this.prisma.jobPost.updateMany({ where: { status: 'Active', expiresAt: { lte: now } }, data: { status: 'Expired', version: { increment: 1 } } });
    await this.prisma.paymentOrder.updateMany({ where: { status: 'Pending', expiresAt: { lte: now } }, data: { status: 'Expired' } });
  }

  private async queueInterviewReminders() {
    const now = new Date();
    for (const window of [{ hours: 24, key: '24h' }, { hours: 1, key: '1h' }]) {
      const from = new Date(now.getTime() + window.hours * 3_600_000 - 120_000);
      const to = new Date(now.getTime() + window.hours * 3_600_000 + 120_000);
      const interviews = await this.prisma.interview.findMany({ where: { status: 'Scheduled', startAt: { gte: from, lte: to } }, include: { application: { include: { jobPost: true, candidate: { select: { email: true } } } } } });
      for (const interview of interviews) {
        const deduplicationKey = `interview:${interview.id}:reminder:${window.key}`;
        await this.prisma.outboxMessage.upsert({ where: { deduplicationKey }, update: {}, create: { type: 'interview.reminder', payload: { interviewId: interview.id, candidateId: interview.application.candidateId, candidateEmail: interview.application.candidate.email, jobTitle: interview.application.jobPost.title, startAt: interview.startAt.toISOString(), meetingUrl: interview.meetingUrl }, deduplicationKey, nextAttemptAt: now } });
      }
    }
  }

  private async queueNewsletter() {
    const bangkok = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', weekday: 'short', hour: '2-digit', hour12: false });
    if (!bangkok.startsWith('Mon') || !/^(0[8-9]|1[0-1]):/.test(bangkok)) return;
    const since = new Date(Date.now() - 7 * 86_400_000);
    const jobs = await this.prisma.jobPost.findMany({ where: { status: 'Active', createdAt: { gte: since } }, orderBy: { createdAt: 'desc' }, take: 20, select: { title: true } });
    if (!jobs.length) return;
    const subscriptions = await this.prisma.newsletterSubscription.findMany({ where: { isActive: true } });
    for (const subscription of subscriptions) {
      const deduplicationKey = `newsletter:${subscription.id}:${new Date().toISOString().slice(0, 10)}`;
      await this.prisma.outboxMessage.upsert({ where: { deduplicationKey }, update: {}, create: { type: 'newsletter.send', payload: { email: subscription.email, titles: jobs.map((job) => job.title) }, deduplicationKey, nextAttemptAt: new Date() } });
    }
  }
}
