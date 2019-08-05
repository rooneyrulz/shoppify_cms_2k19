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
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/login',
    failureFlash: true,
  })(req, res, next);
});

// @ROUTE           >       GET   /user/auth/user
// @DESC            >       GET AUTH USER
// @ACCESS CONTROL  >       PRIVATE
router.get('/user', (req, res, next) => {
  try {
    //
  } catch (error) {
    //
  }
});

// @ROUTE           >       GET   /user/logout
// @DESC            >       LOGOUT USER
// @ACCESS CONTROL  >       PRIVATE
router.get('/logout', (req, res, next) => {
  req.logOut();
  req.flash('success_msg', 'You are logged out!');
  res.redirect('/user/login');
});

export default router;
