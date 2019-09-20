const { Router } = require('express');
const Stripe = require('stripe');

// IMPORT MODELS
const User = require('../../models/User');
const Item = require('../../models/Item');

// IMPORT PASSPORT MIDDLEWARE
const isAuth = require('../../middleware/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = Router();

//  @ROUTE              >    GET  /cart/add/:id
//  @DESC               >    ADD ITEM TO CART
//  @ACCESS CONTROL     >    PRIVATE
router.get('/add/:id', isAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user.id).exec();
    const item = await Item.findById(id).exec();

    if (!item) {
      req.flash('error_msg', 'Item not found!');
      res.redirect('/items');
    }

    if (
      user.items.filter(itm => itm.item.toString() === id).length < 1 &&
      item.users.filter(usr => usr.user.toString() === req.user.id).length < 1
    ) {
      user.items.unshift({ item: id });
      await user.save();

      item.users.unshift({ user: req.user.id });
      await item.save();

      req.flash('success_msg', 'Item added!');
      res.redirect('/items');
    } else {
      req.flash('error_msg', 'Item has already been added!');
      res.redirect('/items');
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    GET  /cart
//  @DESC               >    RENDER CART
//  @ACCESS CONTROL     >    PRIVATE
router.get('/', isAuth, async (req, res, next) => {
  const items = [];
  try {
    const user = await User.findById(req.user.id)
      .select('items')
      .populate('items.item')
      .exec();

    if (user.items.length < 1)
      return res.status(409).render('cart', {
        title: 'Cart',
        error_msg: 'It seems you have not added any items in your cart!'
      });

    for (let i = 0; i < user.items.length; i++) {
      items.unshift(user.items[i]);
    }

    return res.status(200).render('cart', {
      title: 'Cart',
      items,
      stripePubKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

//  @ROUTE              >    POST  /cart/charge
//  @DESC               >    CHARGE FOR CART ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.post('/charge/:amount/:desc', isAuth, async (req, res, next) => {
  const { amount, desc } = req.params;

  // res.setHeader(
  //   `Authorization: Bearer sk_test_CEHSUGH8VpOnRCJNtVkWawkh00b1mHddha`
  // );

  // res.writeHead(200, {
  //   Authorization: 'Bearer sk_test_CEHSUGH8VpOnRCJNtVkWawkh00b1mHddha'
  // });

  try {
    const customer = await stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken
    });

    const charges = await stripe.charges.create({
      amount,
      description: desc,
      currency: 'usd',
      customer: customer.id
    });

    if (charges) {
      return res.render('cart/success', { title: 'Thank you!' });
    }

    console.log('Something went wrong!');
    req.flash('error_msg', 'Something went wrong!');
    res.redirect('/cart');
  } catch (error) {
    console.log(error);
    req.flash('error_msg', 'Something went wrong!');
    res.redirect('/cart');
  }
});

//  @ROUTE              >    DELELE  /cart/:id
//  @DESC               >    DELETE CART ITEM
//  @ACCESS CONTROL     >    PRIVATE
router.delete('/:id', isAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id).exec();

    if (!item)
      return res
        .status(400)
        .render('cart', { title: 'Cart', error_msg: 'Item not found!' });

    if (
      item.users.filter(usr => usr.user.toString() === req.user.id).length < 1
    )
      return res.status(400).render('cart', {
        title: 'Cart',
        error_msg: 'Invalid request!'
      });

    const user = await User.findById(req.user.id).exec();

    if (!user)
      return res
        .status(400)
        .render('cart', { title: 'Cart', error_msg: 'Unauthorized!' });

    if (user.items.filter(itm => itm.item.toString() === id).length < 1)
      return res.status(400).render('cart', {
        title: 'Cart',
        error_msg: 'Invalid request!'
      });

    // FIND REMOVE INDEX FROM ITEM
    const removeIndexFromItem = item.users
      .map(usr => usr.user.toString())
      .indexOf(req.user.id);

    item.users.splice(removeIndexFromItem, 1);

    await item.save();

    // FIND REMOVE INDEX FROM USER
    const removeIndexFromUser = user.items
      .map(itm => itm.item.toString())
      .indexOf(id);

    user.items.splice(removeIndexFromUser, 1);

    await user.save();

    req.flash('success_msg', 'Item removed!');
    res.redirect('/cart');
  } catch (error) {
    console.log(error);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

module.exports = router;
