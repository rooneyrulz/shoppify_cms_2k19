import { Router } from 'express';

const router = Router({ strict: true });

router.get('/login', (req, res, next) =>
  res.status(200).render('auth/login', { title: 'Sign In' })
);

export default router;
