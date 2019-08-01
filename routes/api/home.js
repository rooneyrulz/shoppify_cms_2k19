import { Router } from 'express';

const router = Router({ strict: true });

router.get('/', (req, res, next) =>
  res.status(200).render('home', { title: 'Welcome To Home Page' })
);

export default router;
