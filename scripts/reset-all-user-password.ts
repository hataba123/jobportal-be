// Script cập nhật toàn bộ mật khẩu user về 123456 (hash bcrypt)
// Chạy: npx ts-node scripts/reset-all-user-password.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash('123456', 10);
  // Cập nhật trường passwordHash thay vì password
  const result = await prisma.user.updateMany({
    data: { passwordHash: hash },
  });
  console.log(`Đã cập nhật ${result.count} user về mật khẩu 123456!`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
