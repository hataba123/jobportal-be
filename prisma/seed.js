const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ids = {
  admin: '00000000-0000-0000-0000-000000000001',
  recruiter: '00000000-0000-0000-0000-000000000002',
  candidate: '00000000-0000-0000-0000-000000000003',
  recruiterSecond: '00000000-0000-0000-0000-000000000004',
  candidateSecond: '00000000-0000-0000-0000-000000000005',
  candidateThird: '00000000-0000-0000-0000-000000000006',
  candidateFourth: '00000000-0000-0000-0000-000000000007',
  category: '10000000-0000-0000-0000-000000000001',
  categoryFrontend: '10000000-0000-0000-0000-000000000002',
  categoryData: '10000000-0000-0000-0000-000000000003',
  categoryDevops: '10000000-0000-0000-0000-000000000004',
  categoryMobile: '10000000-0000-0000-0000-000000000005',
  company: '20000000-0000-0000-0000-000000000001',
  companyMicrosoft: '20000000-0000-0000-0000-000000000002',
  companyGoogle: '20000000-0000-0000-0000-000000000003',
  companyAmazon: '20000000-0000-0000-0000-000000000004',
  companyGithub: '20000000-0000-0000-0000-000000000005',
  companyApple: '20000000-0000-0000-0000-000000000006',
  jobPost: '30000000-0000-0000-0000-000000000001',
  jobPostFrontend: '30000000-0000-0000-0000-000000000002',
  jobPostData: '30000000-0000-0000-0000-000000000003',
  jobPostDevops: '30000000-0000-0000-0000-000000000004',
  jobPostMobile: '30000000-0000-0000-0000-000000000005',
  jobPostProduct: '30000000-0000-0000-0000-000000000006',
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

  const extraCategories = [
    { id: ids.categoryFrontend, name: 'Frontend & UI', icon: 'layout', color: '#7c3aed' },
    { id: ids.categoryData, name: 'Dữ liệu & AI', icon: 'database', color: '#0891b2' },
    { id: ids.categoryDevops, name: 'DevOps & Cloud', icon: 'cloud', color: '#ea580c' },
    { id: ids.categoryMobile, name: 'Mobile', icon: 'smartphone', color: '#16a34a' },
  ];
  for (const category of extraCategories) {
    await prisma.category.upsert({ where: { id: category.id }, update: category, create: category });
  }

  await upsertUser(ids.admin, 'seed-admin@example.test', 'Seed Admin', 'Admin', passwordHash);
  await upsertUser(ids.recruiter, 'seed-recruiter@example.test', 'Seed Recruiter', 'Recruiter', passwordHash);
  await upsertUser(ids.candidate, 'seed-candidate@example.test', 'Seed Candidate', 'Candidate', passwordHash);
  await upsertUser(ids.recruiterSecond, 'seed-recruiter-2@example.test', 'Seed Recruiter 2', 'Recruiter', passwordHash);

  const extraCandidates = [
    { id: ids.candidateSecond, email: 'seed-candidate-2@example.test', fullName: 'Nguyễn Minh Anh', skills: 'React, TypeScript, Next.js', years: 4, education: 'Đại học Bách khoa', location: 'Hồ Chí Minh', type: 'Full-time' },
    { id: ids.candidateThird, email: 'seed-candidate-3@example.test', fullName: 'Trần Quốc Bảo', skills: 'Python, SQL, Machine Learning', years: 3, education: 'Đại học Công nghệ', location: 'Đà Nẵng', type: 'Full-time' },
    { id: ids.candidateFourth, email: 'seed-candidate-4@example.test', fullName: 'Lê Hoàng Nam', skills: 'AWS, Docker, Kubernetes', years: 5, education: 'Đại học FPT', location: 'Hà Nội', type: 'Remote' },
  ];
  for (const candidate of extraCandidates) {
    await upsertUser(candidate.id, candidate.email, candidate.fullName, 'Candidate', passwordHash);
    await prisma.candidateProfile.upsert({
      where: { userId: candidate.id },
      update: { skills: candidate.skills, experienceYears: candidate.years, education: candidate.education, preferredLocation: candidate.location, preferredJobType: candidate.type },
      create: { userId: candidate.id, skills: candidate.skills, experienceYears: candidate.years, education: candidate.education, preferredLocation: candidate.location, preferredJobType: candidate.type },
    });
  }

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

  const extraJobPosts = [
    { id: ids.jobPostFrontend, title: 'Frontend Developer (Demo)', description: 'Xây dựng giao diện tuyển dụng tốc độ cao và thân thiện trên nhiều thiết bị.', skillsRequired: 'React, TypeScript, Next.js', location: 'Hồ Chí Minh', salary: 28000000, companyId: ids.companyGoogle, type: 'Full-time', tags: ['React', 'Next.js', 'TypeScript'], categoryId: ids.categoryFrontend, minExperienceYears: 2, educationRequirement: 'Đại học' },
    { id: ids.jobPostData, title: 'Data Engineer (Demo)', description: 'Thiết kế pipeline dữ liệu và mô hình báo cáo cho sản phẩm công nghệ.', skillsRequired: 'Python, SQL, Airflow', location: 'Đà Nẵng', salary: 32000000, companyId: ids.companyAmazon, type: 'Full-time', tags: ['Python', 'SQL', 'Data'], categoryId: ids.categoryData, minExperienceYears: 3, educationRequirement: 'Đại học' },
    { id: ids.jobPostDevops, title: 'Cloud DevOps Engineer (Demo)', description: 'Vận hành hạ tầng cloud an toàn, tự động hóa triển khai và giám sát hệ thống.', skillsRequired: 'AWS, Docker, Kubernetes', location: 'Remote', salary: 38000000, companyId: ids.companyMicrosoft, type: 'Remote', tags: ['AWS', 'Docker', 'Kubernetes'], categoryId: ids.categoryDevops, minExperienceYears: 4, educationRequirement: 'Đại học' },
    { id: ids.jobPostMobile, title: 'Mobile Developer (Demo)', description: 'Phát triển trải nghiệm mobile mượt mà cho ứng dụng tìm việc JobPortal.', skillsRequired: 'Swift, iOS, REST API', location: 'Hồ Chí Minh', salary: 30000000, companyId: ids.companyApple, type: 'Full-time', tags: ['Swift', 'iOS', 'Mobile'], categoryId: ids.categoryMobile, minExperienceYears: 2, educationRequirement: 'Cao đẳng' },
    { id: ids.jobPostProduct, title: 'Product Designer (Demo)', description: 'Thiết kế trải nghiệm người dùng và hệ thống giao diện cho nền tảng tuyển dụng.', skillsRequired: 'Figma, UX Research, Design System', location: 'Hà Nội', salary: 26000000, companyId: ids.companyGithub, type: 'Hybrid', tags: ['Figma', 'UX', 'Product'], categoryId: ids.categoryFrontend, minExperienceYears: 2, educationRequirement: 'Không bắt buộc' },
  ];
  for (const job of extraJobPosts) {
    const { id, ...jobData } = job;
    await prisma.jobPost.upsert({
      where: { id },
      update: { ...jobData, tags: JSON.stringify(job.tags), employerId: ids.recruiter, applicants: 0, status: 'Active', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), deletedAt: null, logo: demoCompanies.find((company) => company.id === job.companyId)?.logo ?? '/uploads/logo/jobportal-demo.svg' },
      create: { id, ...jobData, tags: JSON.stringify(job.tags), employerId: ids.recruiter, applicants: 0, status: 'Active', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), logo: demoCompanies.find((company) => company.id === job.companyId)?.logo ?? '/uploads/logo/jobportal-demo.svg' },
    });
  }

  const applications = [
    { id: '50000000-0000-0000-0000-000000000001', jobPostId: ids.jobPost, candidateId: ids.candidate, status: 'Reviewed' },
    { id: '50000000-0000-0000-0000-000000000002', jobPostId: ids.jobPostFrontend, candidateId: ids.candidateSecond, status: 'Accepted' },
    { id: '50000000-0000-0000-0000-000000000003', jobPostId: ids.jobPostData, candidateId: ids.candidateThird, status: 'Pending' },
    { id: '50000000-0000-0000-0000-000000000004', jobPostId: ids.jobPostDevops, candidateId: ids.candidateFourth, status: 'Reviewed' },
  ];
  for (const application of applications) {
    await prisma.job.upsert({
      where: { id: application.id },
      update: { jobPostId: application.jobPostId, candidateId: application.candidateId, status: application.status, appliedAt: new Date('2026-09-01T08:00:00.000Z') },
      create: { id: application.id, jobPostId: application.jobPostId, candidateId: application.candidateId, status: application.status, appliedAt: new Date('2026-09-01T08:00:00.000Z') },
    });
  }
  await prisma.jobPost.update({ where: { id: ids.jobPost }, data: { applicants: 1 } });
  await prisma.jobPost.update({ where: { id: ids.jobPostFrontend }, data: { applicants: 1 } });
  await prisma.jobPost.update({ where: { id: ids.jobPostData }, data: { applicants: 1 } });
  await prisma.jobPost.update({ where: { id: ids.jobPostDevops }, data: { applicants: 1 } });

  await prisma.savedJob.upsert({ where: { userId_jobPostId: { userId: ids.candidate, jobPostId: ids.jobPostDevops } }, update: {}, create: { userId: ids.candidate, jobPostId: ids.jobPostDevops } });
  await prisma.savedJob.upsert({ where: { userId_jobPostId: { userId: ids.candidateSecond, jobPostId: ids.jobPostMobile } }, update: {}, create: { userId: ids.candidateSecond, jobPostId: ids.jobPostMobile } });

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
    {
      slug: 'lo-trinh-hoc-lap-trinh-vien-moi-bat-dau',
      title: 'Lộ trình học dành cho lập trình viên mới bắt đầu',
      excerpt: 'Một lộ trình thực tế giúp bạn đi từ nền tảng lập trình đến dự án đầu tiên và hồ sơ ứng tuyển.',
      content: 'Hãy chọn một ngôn ngữ chính, nắm chắc cấu trúc dữ liệu cơ bản rồi xây dựng các dự án nhỏ có thể trình bày. Sau mỗi dự án, ghi lại bài học, cải thiện mã nguồn và cập nhật hồ sơ để tiến bộ đều đặn.',
      category: 'Học tập',
      tags: ['Learning', 'Programming', 'Roadmap'],
      readTime: '8 phút',
      featured: false,
      image: '/uploads/images/blog-tech-workspace.jpg',
      publishedAt: '2026-07-28T08:00:00.000Z',
    },
    {
      slug: 'lam-viec-remote-an-toan-va-hieu-qua',
      title: 'Làm việc remote an toàn và hiệu quả',
      excerpt: 'Các thói quen bảo mật và quản lý thời gian cần thiết khi làm việc từ xa trong đội ngũ công nghệ.',
      content: 'Sử dụng trình quản lý mật khẩu, bật xác thực đa yếu tố và chỉ truy cập tài nguyên công ty qua thiết bị được bảo vệ. Bên cạnh đó, hãy chia nhỏ mục tiêu trong ngày và thống nhất giờ cộng tác với đồng đội.',
      category: 'Làm việc',
      tags: ['Remote', 'Security', 'Productivity'],
      readTime: '6 phút',
      featured: false,
      image: '/uploads/images/blog-team-collaboration.jpg',
      publishedAt: '2026-07-21T08:00:00.000Z',
    },
    {
      slug: 'ky-nang-phong-van-system-design',
      title: 'Chuẩn bị phỏng vấn System Design như thế nào?',
      excerpt: 'Khung tư duy đơn giản để phân tích yêu cầu và trình bày thiết kế hệ thống rõ ràng trong buổi phỏng vấn.',
      content: 'Bắt đầu bằng việc làm rõ lưu lượng, dữ liệu và yêu cầu phi chức năng. Sau đó trình bày kiến trúc tổng quan, các điểm nghẽn có thể xảy ra và cách mở rộng theo từng giai đoạn.',
      category: 'Phỏng vấn',
      tags: ['Interview', 'Architecture', 'System Design'],
      readTime: '9 phút',
      featured: true,
      image: '/uploads/images/blog-career-profile.jpg',
      publishedAt: '2026-07-14T08:00:00.000Z',
    },
    {
      slug: 'xay-dung-thuong-hieu-ca-nhan-tren-github',
      title: 'Xây dựng thương hiệu cá nhân trên GitHub',
      excerpt: 'Biến GitHub thành hồ sơ năng lực giúp nhà tuyển dụng hiểu rõ hơn về cách bạn xây dựng sản phẩm.',
      content: 'Chọn một vài dự án tiêu biểu, viết README dễ đọc và duy trì lịch sử commit rõ ràng. Những issue, pull request và tài liệu kỹ thuật chất lượng cũng thể hiện khả năng làm việc nhóm của bạn.',
      category: 'Nghề nghiệp',
      tags: ['GitHub', 'Portfolio', 'Career'],
      readTime: '7 phút',
      featured: false,
      image: '/uploads/images/blog-tech-workspace.jpg',
      publishedAt: '2026-07-07T08:00:00.000Z',
    },
    {
      slug: 'xu-huong-cong-nghe-cho-su-nghiep-it',
      title: 'Xu hướng công nghệ đáng chú ý cho sự nghiệp IT',
      excerpt: 'Những nhóm công nghệ đang tạo ra nhiều cơ hội việc làm và cách chọn hướng phát triển phù hợp.',
      content: 'Cloud, dữ liệu, an toàn thông tin và tự động hóa tiếp tục mở rộng ở nhiều ngành. Thay vì chạy theo mọi xu hướng, hãy chọn một hướng phù hợp với nền tảng hiện tại và đầu tư đủ sâu qua dự án thực tế.',
      category: 'Công nghệ',
      tags: ['Technology', 'Cloud', 'Data'],
      readTime: '6 phút',
      featured: false,
      image: '/uploads/images/blog-team-collaboration.jpg',
      publishedAt: '2026-06-30T08:00:00.000Z',
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
