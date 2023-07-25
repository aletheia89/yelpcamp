const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../helpers/catchAsync');
const { isLoggedin, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

//Routes for /campgrounds:
router
  .route('/')
  //Index:
  .get(catchAsync(campgrounds.index))
  //Create New Campground:
  .post(
    isLoggedin,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

//Campground - New - With Authentication:
router.get('/new', isLoggedin, campgrounds.renderNewForm);

//Routes for /campgrounds/:id:
router
  .route('/:id')
  //Show Campground:
  .get(catchAsync(campgrounds.showCampground))
  //Edit Campground:
  .put(
    isLoggedin,
    isAuthor,
    upload.array('campground[image]'),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  //Delete Campground:
  .delete(isLoggedin, isAuthor, catchAsync(campgrounds.deleteCampground));

//Edit Campground - Form:
router.get(
  '/:id/edit',
  isLoggedin,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
