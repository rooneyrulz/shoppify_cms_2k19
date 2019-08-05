export default (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please login!');
  res.redirect('/user/login');
};
