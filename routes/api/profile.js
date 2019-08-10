import { Router } from 'express';
import { check, validationResult } from 'express-validator';

// IMPORT PASSPORT MIDDLEWARE
import isAuth from '../../middleware/auth';

// IMPORT FILE UPLOADS
import upload from '../../utils/upload';

// IMPORT MODELS
import Profile from '../../models/Profile';
import User from '../../models/User';

const router = Router({ strict: true });

//  @ROUTE              >    GET  /user/profile/create
//  @DESC               >    RENDER CREATE PROFILE
//  @ACCESS CONTROL     >    PRIVATE
router.get('/create', isAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).exec();

    if (profile) {
      return res.redirect('/dashboard');
    }

    return res
      .status(200)
      .render('profile/create', { title: 'Create Profile' });
  } catch (error) {
    console.log(error);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /user/profiles
//  @DESC               >    GET ALL PROFILES
//  @ACCESS CONTROL     >    PUBLIC
router.get('/', async (req, res, next) => {
  try {
    const profiles = await Profile.find()
      .populate('user')
      .exec();

    if (profiles.length < 1)
      return res
        .status(409)
        .render('profile/profiles', { title: 'Profiles not found!' });

    console.log(profiles);
  } catch (error) {
    console.log(error);
    req.flash('error', 'Something went wrong!');
    res.redirect('/user/profiles');
  }
});

//  @ROUTE              >    POST  /user/profiles/create
//  @DESC               >    CREATE PROFILE
//  @ACCESS CONTROL     >    PRIVATE
router.post(
  '/create',
  isAuth,
  upload.single('avatar'),
  [
    check('company', 'Please enter company!')
      .not()
      .isEmpty(),
    check('location', 'Please enter loction!')
      .not()
      .isEmpty(),
    check('status', 'Please enter status!')
      .not()
      .isEmpty(),
    check('skills', 'Please provide at least one skill!')
      .not()
      .isEmpty(),
    check('bio', 'Please enter bio!')
      .not()
      .isEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).render('profile/create', {
        title: 'Create Profile',
        errors: errors.array(),
      });

    if (!req.file)
      return res.status(400).render('profile/create', {
        title: 'Create Profile',
        error_msg: 'Please include your pic!',
      });

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
      github,
    } = req.body;

    // Build a Profile object
    const profileField = {};

    profileField.user = req.user.id;
    if (company) profileField.company = company;
    if (website) profileField.website = website;
    if (location) profileField.location = location;
    if (status) profileField.status = status;
    if (bio) profileField.bio = bio;
    if (req.file) profileField.avatar = req.file.path;
    if (skills)
      profileField.skills = skills.split(',').map(skill => skill.trim());

    // Build a Social Object
    profileField.social = {};

    if (youtube) profileField.social.youtube = youtube;
    if (twitter) profileField.social.twitter = twitter;
    if (facebook) profileField.social.facebook = facebook;
    if (linkedin) profileField.social.linkedin = linkedin;
    if (instagram) profileField.social.instagram = instagram;
    if (github) profileField.social.github = github;

    try {
      // Find profile has already been created
      const user = await User.findById(req.user.id).exec();
      let profile = await Profile.findOne({ user: req.user.id }).exec();

      if (profile) {
        // Update
        await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileField },
          { new: true }
        ).exec();

        req.flash('success_msg', 'Profile updated!');
        res.redirect('/user/profiles/me');
      }

      // Create
      profile = new Profile(profileField);

      await profile.save();

      user.profile = profile.id;

      await user.save();

      req.flash('success_msg', 'Profile created!');
      res.redirect('/user/profiles/me');
    } catch (error) {
      console.log(error);
      req.flash('error', 'Something went wrong!');
      res.redirect('/user/profiles/create');
    }
  }
);

export default router;
