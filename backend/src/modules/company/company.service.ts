import { CompanyRepository } from './company.repository';
import { RegisterCompanyDto, RejectCompanyDto } from './company.validation';
import { AppError } from '../../shared/errors/AppError';
import { notificationService } from '../notification/notification.service';

const companyRepository = new CompanyRepository();

export class CompanyService {
  async registerCompany(userId: string, data: RegisterCompanyDto) {
    const existingCompany = await companyRepository.findCompanyByUserId(userId);
    if (existingCompany) {
      throw { statusCode: 400, message: 'Ce recruteur possède déjà une entreprise' } as AppError;
    }

    const company = await companyRepository.createCompany(userId, data);
    return company;
  }

  async getPendingCompanies() {
    const companies = await companyRepository.findPendingCompanies();
    return companies;
  }

  async getCompanyById(companyId: string) {
    const company = await companyRepository.findCompanyById(companyId);
    if (!company) {
      throw { statusCode: 404, message: 'Entreprise introuvable' } as AppError;
    }
    return company;
  }

  async verifyCompany(adminId: string, companyId: string) {
    const company = await companyRepository.findCompanyById(companyId);
    if (!company) {
      throw { statusCode: 404, message: 'Entreprise introuvable' } as AppError;
    }
    if (company.isVerified) {
      throw { statusCode: 400, message: 'Cette entreprise est déjà vérifiée' } as AppError;
    }

    await companyRepository.verifyCompany(adminId, companyId);
    
    await notificationService.notify(
      company.userId,
      'COMPANY_VERIFIED',
      '✅ Entreprise validée',
      { companyName: company.name }
    );
    
    return;
  }

  async rejectCompany(adminId: string, companyId: string, data: RejectCompanyDto) {
    const company = await companyRepository.findCompanyById(companyId);
    if (!company) {
      throw { statusCode: 404, message: 'Entreprise introuvable' } as AppError;
    }
    if (company.isVerified) {
      throw { statusCode: 400, message: 'Cette entreprise est déjà vérifiée et ne peut plus être rejetée' } as AppError;
    }

    await companyRepository.rejectCompany(adminId, companyId, data.reason);

    await notificationService.notify(
      company.userId,
      'COMPANY_REJECTED',
      'Entreprise non validée',
      { companyName: company.name, reason: data.reason }
    );

    return;
  }
}
