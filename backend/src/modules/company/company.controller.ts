import { Request, Response, NextFunction } from 'express';
import { CompanyService } from './company.service';
import { registerCompanySchema, rejectCompanySchema } from './company.validation';

const companyService = new CompanyService();

export class CompanyController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const validatedData = registerCompanySchema.parse(req.body);
      const company = await companyService.registerCompany(userId, validatedData);

      res.status(201).json({
        success: true,
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  };

  getPending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await companyService.getPendingCompanies();

      res.status(200).json({
        success: true,
        data: { companies },
      });
    } catch (error) {
      next(error);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user!.id;
      const companyId = req.params.id as string;

      await companyService.verifyCompany(adminId, companyId);

      res.status(200).json({
        success: true,
        message: 'Entreprise validée',
      });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user!.id;
      const companyId = req.params.id as string;
      const validatedData = rejectCompanySchema.parse(req.body);

      await companyService.rejectCompany(adminId, companyId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Entreprise rejetée',
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.params.id as string;

      const company = await companyService.getCompanyById(companyId);

      res.status(200).json({
        success: true,
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  };
}
