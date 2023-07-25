const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const ExpressError = require('./helpers/ExpressError');
const Review = require('./models/review');

//Middleware - Login:
module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'To view this page you must be signed in.');
    return res.redirect('/login');
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

//Middleware - Validate Campground:
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Middleware - Authorization - Author Campground:
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash(
      'error',
      "We're sorry, you don't have permission to change this campground."
    );
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//Middleware - Authorization - Author Review:
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash(
      'error',
      "We're sorry, you don't have permission to delete this review."
    );
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//Middleware - Validate Reviews:
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
