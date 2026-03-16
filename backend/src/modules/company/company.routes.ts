import { Router } from 'express';
import { CompanyController } from './company.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';

const router = Router();
const companyController = new CompanyController();

// Admin routes
router.get('/pending', authenticate, authorize(['admin']), companyController.getPending);

// Recruiter routes
router.post('/register', authenticate, authorize(['recruiter']), companyController.register);

// Admin / Parametric routes
router.patch('/:id/verify', authenticate, authorize(['admin']), companyController.verify);
router.patch('/:id/reject', authenticate, authorize(['admin']), companyController.reject);

// Public parametric route (must be last)
router.get('/:id', companyController.getById);

export default router;
