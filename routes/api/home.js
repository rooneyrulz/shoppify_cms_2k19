import { Router } from 'express';

const router = Router({ strict: true });

// @ROUTE           >       GET   /dashboard
// @DESC            >       RENDER DASHBOARD
// @ACCESS CONTROL  >       PRIVATE
router.get('/', (req, res, next) =>
  res.status(200).render('home', { title: 'Home' })
);

export default router;
