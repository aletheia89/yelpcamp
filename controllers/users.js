const User = require('../models/user');

//Register Form:
module.exports.renderRegister = (req, res) => {
  res.render('authentication/register');
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const regUser = await User.register(user, password);
    req.login(regUser, (err) => {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
      }
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

//Login Form:
module.exports.renderLogin = (req, res) => {
  res.render('authentication/login');
};

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back to Yelp Camp!');
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  res.redirect(redirectUrl);
};

//Logout:
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      req.flash('success', 'Goodbye, see you next time!');
      res.redirect('/campgrounds');
    }
  });
};
