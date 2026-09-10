import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

type PrismaTransaction = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class OutboxService {
  async add(
    tx: PrismaTransaction,
    type: string,
    payload: Prisma.InputJsonValue,
    deduplicationKey?: string,
    correlationId?: string,
  ): Promise<void> {
    await tx.outboxMessage.create({
      data: {
        type,
        payload,
        deduplicationKey,
        correlationId,
        nextAttemptAt: new Date(),
      },
    });
  }
}
