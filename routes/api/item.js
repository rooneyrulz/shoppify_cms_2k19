import { Router } from 'express';
import mongoose from 'mongoose';
import { check, validationResult } from 'express-validator';

// IMPORT MODELS
import Item from '../../models/Item';
import User from '../../models/User';

// IMPORT FILE UPLOAD
import upload from '../../utils/upload';

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
        error_msg: 'Items not found!',
      });

    return res.status(200).render('item', { title: 'Items', items });
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /items/add
//  @DESC               >    GET ADD ITEMS
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
      .isEmpty(),
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
        error_msg: 'Choose an image!',
      });

    const { name, price, provider } = req.body;

    try {
      const item = new Item({
        _id: mongoose.Types.ObjectId(),
        name,
        price,
        provider,
        image: req.file.path,
      });

      await item.save();

      req.flash('success_msg', 'Item added!');
      res.redirect('/items');
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
        error_msg: 'Item not found!',
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
router.delete('/:id', (req, res, next) => {});

//  @ROUTE              >    GET  /items/like/:id
//  @DESC               >    LIKE ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.get('/like/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id).exec();

    if (!item)
      return res.status(400).render('item', { error_msg: 'Item not found!' });

    // CHECK IF ITEM HAVE ALREADY BEEN UNLIKED
    if (
      item.unlikes.filter(unlike => unlike.user === req.user._id).length > 0
    ) {
      // FIND REMOVEINDEX
      const removeIndex = item.unlikes
        .map(unlike => unlike.user)
        .indexOf(req.user._id);

      item.unlikes.splice(removeIndex, 1);

      await item.save();
    }

    // CHECK IF ITEM HAVE ALREADY BEEN LIKED
    if (item.likes.filter(like => like.user === req.user._id).length > 0) {
      req.flash('error_msg', 'Item has already been liked!');
      res.redirect('/items');
    }

    item.likes.unshift({ user: req.user._id });

    await item.save();

    req.flash('success_msg', 'Item liked!');
    res.redirect('/items');
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /items/unlike/:id
//  @DESC               >    UNLIKE ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.get('/unlike/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id).exec();

    if (!item)
      return res.status(400).render('item', { error_msg: 'Item not found!' });

    // CHECK IF ITEM HAVE ALREADY BEEN LIKED
    if (item.likes.filter(like => like.user === req.user._id).length > 0) {
      // FIND REMOVEINDEX
      const removeIndex = item.likes
        .map(like => like.user)
        .indexOf(req.user._id);

      item.likes.splice(removeIndex, 1);

      await item.save();
    }

    // CHECK IF ITEM HAVE ALREADY BEEN LIKED
    if (
      item.unlikes.filter(unlike => unlike.user === req.user._id).length > 0
    ) {
      req.flash('error_msg', 'Item has already been unliked!');
      res.redirect('/items');
    }

    item.unlikes.unshift({ user: req.user._id });

    await item.save();

    req.flash('success_msg', 'Item unliked!');
    res.redirect('/items');
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /items/cart/add
//  @DESC               >    ADD ITEM TO CART
//  @ACCESS CONTROL     >    PRIVATE
router.get('/cart/add/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user._id).exec();
    const item = await Item.findById(id).exec();

    if (
      user.items.filter(itm => itm.item.toString() === id.toString()).length <
        1 &&
      item.users.filter(usr => usr.user.toString() === req.user._id.toString())
        .length < 1
    ) {
      user.items.unshift({ item: id });
      item.users.unshift({ user: req.user._id });

      await user.save();
      await item.save();

      req.flash('success_msg', 'Item added!');
      res.redirect('/cart');
    }

    req.flash('error_msg', 'Item has already been added!');
    res.redirect('/items');
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /items/cart
//  @DESC               >    GET ITEM BY USER
//  @ACCESS CONTROL     >    PRIVATE
router.get('/cart', async (req, res, next) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id)
      .populate('items')
      .exec();

    if (user.items.length < 1)
      return res.status(409).render('cart', {
        title: 'Cart Items Not Found',
        error_msg: 'Item not found!',
      });

    return res.status(200).render('cart', { title: 'Cart', items: user.items });
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    DELELE  /items/cart/:id
//  @DESC               >    DELETE ITEM BY USER
//  @ACCESS CONTROL     >    PRIVATE
router.delete('/cart/:id', (req, res, next) => {});

export default router;
