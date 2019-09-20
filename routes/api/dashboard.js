const { Router } = require('express');

// IMPORT PASSPORT MIDDLEWARE
const isAuth = require('../../middleware/auth');

// IMPORT MODELS
const Profile = require('../../models/Profile');

const router = Router({ strict: true });

// @ROUTE           >       GET   /dashboard
// @DESC            >       RENDER DASHBOARD
// @ACCESS CONTROL  >       PRIVATE
router.get('/', isAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).exec();

    if (profile)
      return res
        .status(200)
        .render('dashboard', { title: 'Dashboard', user: req.user, profile });

    return res
      .status(200)
      .render('dashboard', { title: 'Dashboard', user: req.user });
  } catch (error) {
    console.log(error);
    req.flash('error', 'Something went wrong!');
    res.redirect('/dashboard');
  }
});

module.exports = router;
