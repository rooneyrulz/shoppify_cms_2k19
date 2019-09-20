const { Router } = require('express');

const router = Router({ strict: true });

// @ROUTE           >       GET   /dashboard
// @DESC            >       RENDER DASHBOARD
// @ACCESS CONTROL  >       PRIVATE
router.get('/', async (req, res, next) => {
  try {
    if (req.user) return res.status(200).redirect('/dashboard');

    return res.status(200).render('home', { title: 'Home' });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
