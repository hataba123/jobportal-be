import { calculateMatch } from './matching.engine';

describe('matching engine v1', () => {
  it('chuẩn hóa alias kỹ năng và cho điểm kỹ năng đầy đủ', () => {
    const result = calculateMatch(
      {
        id: 'candidate-1',
        skills: 'JavaScript, ReactJS, SQL Server',
      },
      {
        id: 'job-1',
        skillsRequired: 'js, react, mssql',
      },
    );

    expect(result.matchedSkills).toEqual(['javascript', 'react', 'sqlserver']);
    expect(result.missingSkills).toEqual([]);
    expect(result.breakdown.skills).toBe(60);
    expect(result.totalScore).toBe(60);
  });

  it('trả breakdown minh bạch cho kinh nghiệm, học vấn và ưu tiên', () => {
    const result = calculateMatch(
      {
        id: 'candidate-2',
        skills: 'TypeScript',
        experienceYears: 4,
        education: 'Đại học Công nghệ',
        preferredLocation: 'Hà Nội',
        preferredJobType: 'Full-time',
        expectedSalary: 1500,
      },
      {
        id: 'job-2',
        skillsRequired: 'typescript, nodejs',
        location: 'Hà Nội',
        type: 'Full-time',
        salary: 2000,
        minExperienceYears: 3,
        educationRequirement: 'dai hoc',
      },
    );

    expect(result.breakdown).toEqual({
      skills: 30,
      experience: 20,
      education: 10,
      preferences: 10,
    });
    expect(result.totalScore).toBe(70);
    expect(result.missingSkills).toEqual(['nodejs']);
    expect(result.reason).toContain('Khớp 1/2 kỹ năng');
  });
});
