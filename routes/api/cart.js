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
  try {
    const user = await User.findById(req.user.id)
      .select('items')
      .populate('items.item')
      .exec();

    console.log(user);

    if (user.items.length < 1)
      return res.status(409).render('cart', {
        title: 'Cart Items Not Found',
        error_msg: 'It seems you have not added any items in your cart!',
      });

    return res.status(200).render('cart', { title: 'Cart', items: user.items });
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

    if (!item) return res.status(400).render('error', { title: 'Cart' });

    if (
      item.users.filter(usr => usr.user.toString() === req.user.id).length === 0
    ) {
      req.flash('error_msg', 'Invalid request!');
      res.redirect('/cart');
    } else {
      //
    }
  } catch (error) {
    console.log(error);
    return res.status(500).render('error', { title: 'Server Error!' });
  }
});

export default router;
