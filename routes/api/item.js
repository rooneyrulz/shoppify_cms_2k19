const { Router } = require('express');
const { check, validationResult } = require('express-validator');

// IMPORT MODELS
const Item = require('../../models/Item');

// IMPORT FILE UPLOAD
const upload = require('../../utils/upload');

// IMPORT PASSPORT MIDDLEWARE
const isAuth = require('../../middleware/auth');

const router = Router({ strict: true });

//  @ROUTE              >    GET  /items
//  @DESC               >    GET ITEMS
//  @ACCESS CONTROL     >    PUBLIC
router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find()
      .sort({ date: -1 })
      .exec();

    if (items.length < 1)
      return res.status(409).render('item', {
        title: 'Items',
        error_msg: 'Items not found!'
      });

    return res.status(200).render('item', { title: 'Items', items });
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /items/add
//  @DESC               >    RENDER ADD ITEMS
//  @ACCESS CONTROL     >    PUBLIC
router.get('/add', (req, res, next) =>
  res.status(200).render('item/addItem', { title: 'Add Items' })
);

//  @ROUTE              >    POST  /items/add
//  @DESC               >    ADD ITEMS
//  @ACCESS CONTROL     >    ADMIN
router.post(
  '/add',
  upload.single('image'),
  [
    check('name', 'Please enter item!')
      .not()
      .isEmpty(),
    check('price', 'Please enter price!')
      .not()
      .isEmpty(),
    check('provider', 'Please enter provider!')
      .not()
      .isEmpty()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res
        .status(400)
        .render('item/addItem', { title: 'Add Items', errors: errors.array() });

    if (!req.file)
      return res.status(400).render('item/addItem', {
        title: 'Add Items',
        error_msg: 'Choose an image!'
      });

    const { name, price, provider } = req.body;

    try {
      const item = new Item({
        name,
        price,
        provider,
        image: req.file.path
      });

      await item.save();

      req.flash('success_msg', 'Item added!');
      res.redirect('/items/add');
    } catch (error) {
      console.log(error.message);
      return res.status(500).render('error', { title: 'Server Error!' });
    }
  }
);

//  @ROUTE              >    GET  /items/:id
//  @DESC               >    GET ITEM
//  @ACCESS CONTROL     >    PUBLIC
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id).exec();

    if (!item)
      return res.status(400).render('item/item', {
        title: 'Item Not Found',
        error_msg: 'Item not found!'
      });
    return res.status(200).render('item/item', { title: 'Item', item });
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    DELETE  /items/:id
//  @DESC               >    DELETE ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.delete('/:id', isAuth, (req, res, next) => {});

//  @ROUTE              >    GET  /items/like/:id
//  @DESC               >    LIKE ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.get('/like/:id', isAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id).exec();

    if (!item)
      return res.status(400).render('item', { error_msg: 'Item not found!' });

    // CHECK IF ITEM HAVE ALREADY BEEN UNLIKED
    if (
      item.unlikes.filter(unlike => unlike.user.toString() === req.user.id)
        .length > 0 &&
      item.likes.filter(like => like.user.toString() === req.user.id).length < 1
    ) {
      // FIND REMOVEINDEX
      const removeIndex = item.unlikes
        .map(unlike => unlike.user.toString())
        .indexOf(req.user.id);

      item.unlikes.splice(removeIndex, 1);

      item.likes.unshift({ user: req.user.id });

      req.flash('success_msg', 'Item liked!');
      await item.save();

      res.redirect('/items');
    } else {
      // CHECK IF ITEM HAVE ALREADY BEEN LIKED
      if (
        item.likes.filter(like => like.user.toString() === req.user.id).length >
        0
      ) {
        req.flash('error_msg', 'Item has already been liked!');
        res.redirect('/items');
      } else {
        item.likes.unshift({ user: req.user.id });

        await item.save();

        req.flash('success_msg', 'Item liked!');
        res.redirect('/items');
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /items/unlike/:id
//  @DESC               >    UNLIKE ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.get('/unlike/:id', isAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id).exec();

    if (!item)
      return res.status(400).render('item', { error_msg: 'Item not found!' });

    // CHECK IF ITEM HAVE ALREADY BEEN LIKED
    if (
      item.likes.filter(like => like.user.toString() === req.user.id).length >
        0 &&
      item.unlikes.filter(unlike => unlike.user.toString() === req.user.id)
        .length < 1
    ) {
      // FIND REMOVEINDEX
      const removeIndex = item.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

      item.likes.splice(removeIndex, 1);

      item.unlikes.unshift({ user: req.user.id });

      await item.save();

      req.flash('success_msg', 'Item unliked!');
      res.redirect('/items');
    } else {
      // CHECK IF ITEM HAVE ALREADY BEEN LIKED
      if (
        item.unlikes.filter(unlike => unlike.user.toString() === req.user.id)
          .length > 0
      ) {
        req.flash('error_msg', 'Item has already been unliked!');
        res.redirect('/items');
      } else {
        item.unlikes.unshift({ user: req.user.id });

        await item.save();

        req.flash('success_msg', 'Item unliked!');
        res.redirect('/items');
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

module.exports = router;
