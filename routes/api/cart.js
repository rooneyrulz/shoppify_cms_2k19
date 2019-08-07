import { Router } from 'express';

// IMPORT MODELS
import User from '../../models/User';
import Item from '../../models/Item';

// IMPORT PASSPORT MIDDLEWARE
import isAuth from '../../middleware/auth';

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
//  @DESC               >    GET ITEM BY USER
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
        error_msg: 'It seems you have not added any items in your cart!',
      });

    for (let i = 0; i < user.items.length; i++) {
      items.unshift(user.items[i]);
    }

    return res.status(200).render('cart', { title: 'Cart', items });
  } catch (error) {
    console.log(error);
    return res.status(500).render('error', { title: 'Server Error!' });
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
        error_msg: 'Invalid request!',
      });

    const user = await User.findById(req.user.id).exec();

    if (!user)
      return res
        .status(400)
        .render('cart', { title: 'Cart', error_msg: 'Unauthorized!' });

    if (user.items.filter(itm => itm.item.toString() === id).length < 1)
      return res.status(400).render('cart', {
        title: 'Cart',
        error_msg: 'Invalid request!',
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

export default router;
