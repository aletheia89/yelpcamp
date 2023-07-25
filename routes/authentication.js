const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const passport = require('passport');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

//Register:
router
  .route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

//Login:
router
  .route('/login')
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    users.login
  );

//Logout:
router.get('/logout', users.logout);

module.exports = router;
