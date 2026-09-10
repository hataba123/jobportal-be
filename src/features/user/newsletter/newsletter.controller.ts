import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../common/audit/audit-log.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/newsletter')
export class NewsletterController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  @Post('subscribe')
  async subscribe(@Req() req) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId }, select: { email: true } });
    if (!user) return { active: false };
    const existing = await this.prisma.newsletterSubscription.findFirst({ where: { userId: req.user.userId, email: user.email } });
    const subscription = existing
      ? await this.prisma.newsletterSubscription.update({ where: { id: existing.id }, data: { isActive: true, unsubscribedAt: null } })
      : await this.prisma.newsletterSubscription.create({ data: { userId: req.user.userId, email: user.email } });
    await this.audit.add(this.prisma, { actorId: req.user.userId, action: 'Newsletter.Subscribed', entityType: 'NewsletterSubscription', entityId: subscription.id, after: { active: true } });
    return { active: true };
  }

  @Post('unsubscribe')
  async unsubscribe(@Req() req) {
    const existing = await this.prisma.newsletterSubscription.findFirst({ where: { userId: req.user.userId, isActive: true } });
    if (!existing) return { active: false };
    await this.prisma.newsletterSubscription.update({ where: { id: existing.id }, data: { isActive: false, unsubscribedAt: new Date() } });
    await this.audit.add(this.prisma, { actorId: req.user.userId, action: 'Newsletter.Unsubscribed', entityType: 'NewsletterSubscription', entityId: existing.id, before: { active: true }, after: { active: false } });
    return { active: false };
  }
}
