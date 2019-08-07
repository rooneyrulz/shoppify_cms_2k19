import { Router } from 'express';

// IMPORT PASSPORT MIDDLEWARE
import isAuth from '../../middleware/auth';

const router = Router({ strict: true });

// @ROUTE           >       GET   /dashboard
// @DESC            >       RENDER DASHBOARD
// @ACCESS CONTROL  >       PRIVATE
router.get('/', isAuth, (req, res, next) =>
  res.status(200).render('dashboard', { title: 'Dashboard', user: req.user })
);

export default router;
