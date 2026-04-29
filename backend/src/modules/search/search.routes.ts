import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

router.get('/', searchController.globalSearch);
router.get('/users', (req, _res, next) => {
  req.query.type = 'users';
  searchController.globalSearch(req, _res, next);
});

export default router;
