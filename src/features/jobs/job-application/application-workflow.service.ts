import { BadRequestException, Injectable } from '@nestjs/common';
import { ApplyStatus } from '@prisma/client';

/** Tập trung toàn bộ luật chuyển trạng thái, không để controller gán status tùy ý. */
@Injectable()
export class ApplicationWorkflowService {
  parse(value: string): ApplyStatus {
    const normalized = String(value ?? '').trim().toLowerCase();
    const aliases: Record<string, ApplyStatus> = {
      pending: ApplyStatus.Applied,
      applied: ApplyStatus.Applied,
      reviewed: ApplyStatus.Screening,
      screening: ApplyStatus.Screening,
      interview: ApplyStatus.Interview,
      accepted: ApplyStatus.Offer,
      offer: ApplyStatus.Offer,
      hired: ApplyStatus.Hired,
      rejected: ApplyStatus.Rejected,
      withdrawn: ApplyStatus.Withdrawn,
    };
    const parsed = aliases[normalized];
    if (!parsed) throw new BadRequestException('Trạng thái hồ sơ không hợp lệ.');
    return parsed;
  }

  isTerminal(status: ApplyStatus): boolean {
    return ([ApplyStatus.Hired, ApplyStatus.Rejected, ApplyStatus.Withdrawn] as ApplyStatus[]).includes(status);
  }

  assertRecruiterTransition(from: ApplyStatus, to: ApplyStatus, reason?: string): void {
    if (to === ApplyStatus.Rejected && !reason?.trim()) {
      throw new BadRequestException('Cần cung cấp lý do từ chối hồ sơ.');
    }
    const valid =
      (from === ApplyStatus.Applied && to === ApplyStatus.Screening) ||
      (from === ApplyStatus.Interview && to === ApplyStatus.Offer) ||
      (from === ApplyStatus.Offer && to === ApplyStatus.Hired) ||
      (([ApplyStatus.Applied, ApplyStatus.Screening, ApplyStatus.Interview, ApplyStatus.Offer] as ApplyStatus[]).includes(from) &&
        to === ApplyStatus.Rejected);
    if (!valid) {
      throw new BadRequestException(`Không thể chuyển hồ sơ từ ${from} sang ${to}.`);
    }
  }
}
