const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ids = {
  admin: '00000000-0000-0000-0000-000000000001',
  recruiter: '00000000-0000-0000-0000-000000000002',
  candidate: '00000000-0000-0000-0000-000000000003',
  category: '10000000-0000-0000-0000-000000000001',
  company: '20000000-0000-0000-0000-000000000001',
  companyMicrosoft: '20000000-0000-0000-0000-000000000002',
  companyGoogle: '20000000-0000-0000-0000-000000000003',
  companyAmazon: '20000000-0000-0000-0000-000000000004',
  companyGithub: '20000000-0000-0000-0000-000000000005',
  companyApple: '20000000-0000-0000-0000-000000000006',
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

async function upsertBlogAuthor({ name, avatar, role }) {
  const existing = await prisma.blogAuthor.findFirst({ where: { name } });
  const data = { name, avatar, role };
  if (existing) {
    return prisma.blogAuthor.update({ where: { id: existing.id }, data });
  }
  return prisma.blogAuthor.create({ data });
}

async function upsertBlog(authorId, fixture) {
  const data = {
    title: fixture.title,
    excerpt: fixture.excerpt,
    content: fixture.content,
    slug: fixture.slug,
    category: fixture.category,
    tags: JSON.stringify(fixture.tags),
    publishedAt: new Date(fixture.publishedAt),
    readTime: fixture.readTime,
    featured: fixture.featured,
    image: fixture.image,
    authorId,
  };
  const existing = await prisma.blog.findFirst({ where: { slug: fixture.slug } });
  if (existing) {
    return prisma.blog.update({ where: { id: existing.id }, data });
  }
  return prisma.blog.create({ data });
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

  const demoCompanies = [
    {
      id: ids.companyMicrosoft,
      name: 'Microsoft Vietnam (Demo)',
      logo: '/uploads/logo/company-microsoft.svg',
      description: 'Dữ liệu công ty demo dùng để kiểm tra hiển thị logo thương hiệu.',
      location: 'Hà Nội',
      employees: '1000+',
      industry: 'Công nghệ thông tin',
      openJobs: 0,
      rating: 4.8,
      website: 'https://www.microsoft.com',
      founded: '1975',
      tags: 'Cloud,AI,Engineering',
    },
    {
      id: ids.companyGoogle,
      name: 'Google Vietnam (Demo)',
      logo: '/uploads/logo/company-google.svg',
      description: 'Dữ liệu công ty demo dùng để kiểm tra hiển thị logo thương hiệu.',
      location: 'Hồ Chí Minh',
      employees: '1000+',
      industry: 'Công nghệ thông tin',
      openJobs: 0,
      rating: 4.9,
      website: 'https://about.google',
      founded: '1998',
      tags: 'Search,Cloud,AI',
    },
    {
      id: ids.companyAmazon,
      name: 'Amazon Web Services (Demo)',
      logo: '/uploads/logo/company-amazon.svg',
      description: 'Dữ liệu công ty demo dùng để kiểm tra hiển thị logo thương hiệu.',
      location: 'Đà Nẵng',
      employees: '501-1000',
      industry: 'Điện toán đám mây',
      openJobs: 0,
      rating: 4.7,
      website: 'https://aws.amazon.com',
      founded: '2006',
      tags: 'AWS,Cloud,DevOps',
    },
    {
      id: ids.companyGithub,
      name: 'GitHub Vietnam (Demo)',
      logo: '/uploads/logo/company-github.svg',
      description: 'Dữ liệu công ty demo dùng để kiểm tra hiển thị logo thương hiệu.',
      location: 'Hà Nội',
      employees: '201-500',
      industry: 'Nền tảng phát triển',
      openJobs: 0,
      rating: 4.6,
      website: 'https://github.com',
      founded: '2008',
      tags: 'Git,Open source,Developer tools',
    },
    {
      id: ids.companyApple,
      name: 'Apple Developer (Demo)',
      logo: '/uploads/logo/company-apple.svg',
      description: 'Dữ liệu công ty demo dùng để kiểm tra hiển thị logo thương hiệu.',
      location: 'Hồ Chí Minh',
      employees: '1000+',
      industry: 'Sản phẩm công nghệ',
      openJobs: 0,
      rating: 4.8,
      website: 'https://developer.apple.com',
      founded: '1976',
      tags: 'iOS,Swift,Design',
    },
  ];
  for (const company of demoCompanies) {
    const { id, ...companyData } = company;
    await prisma.company.upsert({
      where: { id },
      update: { ...companyData, userId: ids.recruiter, deletedAt: null, verificationStatus: 'Verified', verifiedAt: new Date() },
      create: { id, ...companyData, userId: ids.recruiter, verificationStatus: 'Verified', verifiedAt: new Date() },
    });
  }

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

  const blogAuthor = await upsertBlogAuthor({
    name: 'JobPortal Editorial Team',
    avatar: '/uploads/logo/jobportal-demo.svg',
    role: 'Admin',
  });
  const blogFixtures = [
    {
      slug: 'xay-dung-ho-so-nghe-nghiep-noi-bat',
      title: 'Cách xây dựng hồ sơ nghề nghiệp nổi bật năm 2026',
      excerpt: 'Một hồ sơ rõ ràng, có số liệu và tập trung vào kết quả giúp nhà tuyển dụng hiểu nhanh giá trị của bạn.',
      content: 'Bắt đầu bằng phần giới thiệu ngắn, sau đó ưu tiên thành tựu có thể đo lường và các kỹ năng phù hợp với vị trí đang ứng tuyển. Hãy cập nhật hồ sơ định kỳ để phản ánh đúng kinh nghiệm mới nhất.',
      category: 'Phát triển sự nghiệp',
      tags: ['CV', 'Career', 'Job search'],
      readTime: '6 phút',
      featured: true,
      image: '/uploads/images/blog-career-profile.jpg',
      publishedAt: '2026-08-20T08:00:00.000Z',
    },
    {
      slug: 'ky-nang-cong-tac-trong-doi-ngu',
      title: 'Kỹ năng cộng tác giúp bạn nổi bật trong đội ngũ',
      excerpt: 'Giao tiếp chủ động, phản hồi có cấu trúc và tinh thần chia sẻ là nền tảng của mọi đội ngũ hiệu quả.',
      content: 'Khi làm việc nhóm, hãy thống nhất mục tiêu, ghi nhận trách nhiệm và chia sẻ tiến độ minh bạch. Những thói quen nhỏ này giúp giảm hiểu nhầm và tạo niềm tin lâu dài giữa các thành viên.',
      category: 'Kỹ năng',
      tags: ['Teamwork', 'Soft skills', 'Productivity'],
      readTime: '5 phút',
      featured: true,
      image: '/uploads/images/blog-team-collaboration.jpg',
      publishedAt: '2026-08-12T08:00:00.000Z',
    },
    {
      slug: 'checklist-chuan-bi-phong-van-cong-nghe',
      title: 'Checklist chuẩn bị phỏng vấn vị trí công nghệ',
      excerpt: 'Từ nghiên cứu công ty đến phần trình bày dự án, đây là checklist ngắn giúp bạn tự tin trước buổi phỏng vấn.',
      content: 'Đọc kỹ mô tả công việc, chuẩn bị hai đến ba câu chuyện theo mô hình STAR và kiểm tra lại các dự án có liên quan. Cuối buổi, hãy đặt câu hỏi về đội ngũ, kỳ vọng 90 ngày đầu và cách đo lường thành công.',
      category: 'Phỏng vấn',
      tags: ['Interview', 'Technology', 'Preparation'],
      readTime: '7 phút',
      featured: false,
      image: '/uploads/images/blog-tech-workspace.jpg',
      publishedAt: '2026-08-05T08:00:00.000Z',
    },
  ];
  for (const fixture of blogFixtures) {
    await upsertBlog(blogAuthor.id, fixture);
  }

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
