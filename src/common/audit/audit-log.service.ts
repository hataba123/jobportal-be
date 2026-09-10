import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaTransaction = Prisma.TransactionClient | PrismaClient;
const SENSITIVE = /password|token|secret|signature|cv|resume|storage|path/i;

@Injectable()
export class AuditLogService {
  async add(
    tx: PrismaTransaction,
    data: {
      actorId?: string;
      action: string;
      entityType: string;
      entityId: string;
      before?: unknown;
      after?: unknown;
      ipAddress?: string;
      correlationId?: string;
    },
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        before: this.sanitize(data.before),
        after: this.sanitize(data.after),
        ipAddress: data.ipAddress,
        correlationId: data.correlationId,
      },
    });
  }

  private sanitize(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined || value === null) return undefined;
    const visit = (item: unknown): unknown => {
      if (Array.isArray(item)) return item.map(visit);
      if (item && typeof item === 'object') {
        return Object.fromEntries(
          Object.entries(item)
            .filter(([key]) => !SENSITIVE.test(key))
            .map(([key, child]) => [key, visit(child)]),
        );
      }
      return item;
    };
    return visit(value) as Prisma.InputJsonValue;
  }
}
