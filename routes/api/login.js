import { Router } from 'express';
import passport from 'passport';

const router = Router({ strict: true });

// @ROUTE           >       GET   /user/login
// @DESC            >       RENDER LOGIN
// @ACCESS CONTROL  >       PUBLIC
router.get('/login', (req, res, next) =>
  res.status(200).render('auth/login', { title: 'Sign In' })
);

// @ROUTE           >       POST   /user/login
// @DESC            >       LOGIN USER
// @ACCESS CONTROL  >       PUBLIC
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/login',
    failureFlash: true,
  }),
  (req, res, next) => {
    console.log(req.body);
    res.redirect('/dashboard');
  }
);

export default router;
