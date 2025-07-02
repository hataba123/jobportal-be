// Interface service quản lý job post
export interface IJobPostService {
  create(employerId: string, dto: any): Promise<any>;
  update(id: string, dto: any): Promise<any>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<any>;
  getAll(): Promise<any[]>;
  getByEmployer(employerId: string): Promise<any[]>;
}
