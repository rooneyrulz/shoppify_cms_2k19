import { Router } from 'express';
import passport from 'passport';

const router = Router({ strict: true });

router.get('/login', (req, res, next) =>
  res.status(200).render('auth/login', { title: 'Sign In' })
);

router.post('/login', (req, res, next) =>
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/login',
    failureFlash: true,
  })(req, res, next)
);

export default router;
