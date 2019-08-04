import { Router } from 'express';
import { hash } from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// IMPORT MODELS
import User from '../../models/User';

const router = Router({ strict: true });

// @ROUTE             >     GET   user/register
// @DESC              >     RENDER REGISTER PAGE
// @ACCESS CONTROL    >     PUBLIC
router.get('/register', (req, res, next) =>
  res.status(200).render('auth/register', { title: 'Sign Up' })
);

// @ROUTE             >     POST   user/register
// @DESC              >     ADD USERS
// @ACCESS CONTROL    >     PUBLIC
router.post(
  '/register',
  [
    check('name', 'Please enter name!')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter password!')
      .not()
      .isEmpty(),
    check('cPassword', 'Please confirm password!')
      .not()
      .isEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    const { name, email, password, cPassword } = req.body;

    if (!errors.isEmpty())
      return res
        .status(400)
        .render('auth/register', { title: 'Sign Up', errors: errors.array() });

    if (password !== cPassword) {
      req.flash('error_msg', 'Password is not match!');
      res.redirect('/user/register');
    }

    try {
      const user = await User.findOne({ email }).exec();

      if (user)
        return res.status(409).render('auth/register', {
          title: 'Sign Up',
          error_msg: 'User already exist!',
        });

      const hashedPwd = await hash(password, 12);

      if (!hashedPwd)
        return res.status(500).render('error', { title: 'Server Error!' });

      const newUser = new User({
        _id: mongoose.Types.ObjectId(),
        name,
        email,
        password: hashedPwd,
      });

      await newUser.save();

      req.flash('success_msg', "Let's login!");
      res.redirect('/user/login');
    } catch (error) {
      console.log(error.message);
      return res.status(500).render('error', { title: 'Server Error!' });
    }
  }
);

export default router;
