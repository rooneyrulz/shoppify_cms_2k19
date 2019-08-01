import { Router } from 'express';

const router = Router({ strict: true });

router.get('/', (req, res, next) =>
  res.status(200).render('auth/register', { title: 'Sign Up' })
);

export default router;
