const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ids = {
  admin: '00000000-0000-0000-0000-000000000001',
  recruiter: '00000000-0000-0000-0000-000000000002',
  candidate: '00000000-0000-0000-0000-000000000003',
  category: '10000000-0000-0000-0000-000000000001',
  company: '20000000-0000-0000-0000-000000000001',
  jobPost: '30000000-0000-0000-0000-000000000001',
  plan: '40000000-0000-0000-0000-000000000001',
};

async function upsertUser(id, email, fullName, role, passwordHash) {
  return prisma.user.upsert({
    where: { id },
    update: { email, fullName, role, passwordHash, deletedAt: null },
    create: { id, email, fullName, role, passwordHash },
  });
}

async function main() {
  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword) {
    throw new Error('SEED_PASSWORD là bắt buộc khi chạy seed.');
  }
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  await prisma.category.upsert({
    where: { id: ids.category },
    update: { name: 'Công nghệ thông tin', icon: 'code', color: '#2563eb' },
    create: {
      id: ids.category,
      name: 'Công nghệ thông tin',
      icon: 'code',
      color: '#2563eb',
    },
  });

  await upsertUser(ids.admin, 'seed-admin@example.test', 'Seed Admin', 'Admin', passwordHash);
  await upsertUser(ids.recruiter, 'seed-recruiter@example.test', 'Seed Recruiter', 'Recruiter', passwordHash);
  await upsertUser(ids.candidate, 'seed-candidate@example.test', 'Seed Candidate', 'Candidate', passwordHash);

  await prisma.candidateProfile.upsert({
    where: { userId: ids.candidate },
    update: {
      skills: 'TypeScript, NestJS, PostgreSQL',
      experienceYears: 3,
      education: 'Đại học Công nghệ',
      preferredLocation: 'Hà Nội',
      preferredJobType: 'Full-time',
    },
    create: {
      userId: ids.candidate,
      skills: 'TypeScript, NestJS, PostgreSQL',
      experienceYears: 3,
      education: 'Đại học Công nghệ',
      preferredLocation: 'Hà Nội',
      preferredJobType: 'Full-time',
    },
  });

  await prisma.company.upsert({
    where: { id: ids.company },
    update: {
      name: 'JobPortal Demo Company',
      openJobs: 1,
      rating: 5,
      verificationStatus: 'Verified',
      verifiedAt: new Date(),
      logo: '/uploads/logo/jobportal-demo.svg',
      deletedAt: null,
    },
    create: {
      id: ids.company,
      name: 'JobPortal Demo Company',
      description: 'Công ty giả lập dùng cho môi trường phát triển.',
      location: 'Hà Nội',
      employees: '51-200',
      industry: 'Công nghệ thông tin',
      openJobs: 1,
      rating: 5,
      userId: ids.recruiter,
      verificationStatus: 'Verified',
      verifiedAt: new Date(),
      logo: '/uploads/logo/jobportal-demo.svg',
    },
  });

  await prisma.jobPost.upsert({
    where: { id: ids.jobPost },
    update: {
      title: 'Backend Engineer (Demo)',
      status: 'Active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deletedAt: null,
      logo: '/uploads/logo/jobportal-demo.svg',
    },
    create: {
      id: ids.jobPost,
      title: 'Backend Engineer (Demo)',
      description: 'Tin tuyển dụng giả lập để kiểm thử luồng ứng tuyển và matching.',
      skillsRequired: 'TypeScript, NestJS, PostgreSQL',
      location: 'Hà Nội',
      salary: 25000000,
      employerId: ids.recruiter,
      companyId: ids.company,
      type: 'Full-time',
      tags: JSON.stringify(['NestJS', 'PostgreSQL']),
      applicants: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      minExperienceYears: 2,
      educationRequirement: 'Đại học',
      categoryId: ids.category,
      logo: '/uploads/logo/jobportal-demo.svg',
    },
  });

  await prisma.servicePlan.upsert({
    where: { id: ids.plan },
    update: { name: 'Demo Recruiter Pack', price: 99000, currency: 'VND', isActive: true },
    create: {
      id: ids.plan,
      name: 'Demo Recruiter Pack',
      price: 99000,
      currency: 'VND',
      isActive: true,
    },
  });
  await prisma.planEntitlement.upsert({
    where: { planId_creditType: { planId: ids.plan, creditType: 'JobPost' } },
    update: { quantity: 3, expiresInDays: 30 },
    create: { planId: ids.plan, creditType: 'JobPost', quantity: 3, expiresInDays: 30 },
  });

  console.log('Đã seed fixture JobPortal cho môi trường phát triển.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
