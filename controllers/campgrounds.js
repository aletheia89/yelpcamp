const { model } = require('mongoose');
const maptilerClient = require('@maptiler/client');
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

maptilerClient.config.apiKey = process.env.MAPTILER_TOKEN;

//Index:
module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

//New Campground - Form:
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

//New Campground - Create:
module.exports.createCampground = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  // const mapImageLink = maptilerClient.staticMaps.centered(
  //   geoData.features[0].geometry.coordinates,
  //   12.5,
  //   {
  //     hiDPI: true,
  //     width: 1000,
  //     height: 1000,
  //     style: 'streets-v2',
  //   }
  // );
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  // campground.mapImageLink = mapImageLink;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'Your new campground has been succesfully added!');
  res.redirect(`/campgrounds/${campground._id}`);
};

//Campground - Show:
module.exports.showCampground = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('author');
  if (!campground) {
    req.flash('error', 'Sorry, your campground has not been found.');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
};

//Edit Campground - Form:
module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Sorry, your campground has not been found.');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

//Edit Campground - Edit:
module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    {
      runValidators: true,
      new: true,
    }
  );
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash('success', 'Your campground has been successfully updated!');
  res.redirect(`/campgrounds/${campground._id}`);
};

//Delete Campground:
module.exports.deleteCampground = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash(
    'success',
    'Sorry to see you go! Your campground has been deleted.'
  );
  res.redirect('/campgrounds');
};
