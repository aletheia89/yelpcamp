const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const { reviewSchema } = require('../schemas');
const ExpressError = require('../helpers/ExpressError');
const catchAsync = require('../helpers/catchAsync');
const { validateReview, isLoggedin, isReviewAuthor } = require('../middleware');

//Review - New:
router.post('/', isLoggedin, validateReview, catchAsync(reviews.createReview));

//Review - Delete:
router.delete(
  '/:reviewId',
  isLoggedin,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
