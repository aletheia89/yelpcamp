if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/authentication');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);

// const dbUrl = process.env.DB_URL;

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
// mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

//Helmet - Content Security Policy:
// const scriptSrcUrls = [
//   'https://cdn.jsdelivr.net/',
//   'https://cdn.maptiler.com',
//   'https://cdn.tiles.mapbox.com/',
//   'ttps://api.maptiler.com/maps/',
//   'https://kit.fontawesome.com/',
//   'https://cdnjs.cloudflare.com/',
// ];
// const styleSrcUrls = [
//   'https://kit-free.fontawesome.com/',
//   'https://cdn.jsdelivr.net',
//   'https://cdn.maptiler.com',
//   'ttps://api.maptiler.com/maps/',
//   'https://cdn.tiles.mapbox.com/',
//   'https://fonts.googleapis.com/',
//   'https://use.fontawesome.com/',
// ];
// const connectSrcUrls = [
//   'https://cdn.maptiler.com',
//   'ttps://api.maptiler.com/maps/',
//   'https://a.tiles.maptiler.com/',
//   'https://b.tiles.maptiler.com/',
//   'https://events.maptiler.com/',
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         'blob:',
//         'data:',
//         'https://res.cloudinary.com/dew0jf3zd',
//         'https://images.unsplash.com/',
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

//Mongo DB Session Store:
const store = new MongoDBStore({
  url: 'mongodb://127.0.0.1:27017/yelp-camp',
  secret: 'waitingforabettersecret',
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('Oh no, session store error!', e);
});

//Cookies, Session and Flash:
const sessionConfig = {
  store,
  name: 'session',
  secret: 'waitingforabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//Authentication:
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

//Authentication - To store and unstore user in session:
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash-Middleware:
app.use((req, res, next) => {
  res.locals.signedinUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//Home:
app.get('/', (req, res) => {
  res.render('home');
});

//Authentication - Routes:
app.use('/', authRoutes);

//Campgrounds - Routes:
app.use('/campgrounds', campgroundRoutes);

//Reviews - Routes:
app.use('/campgrounds/:id/reviews', reviewRoutes);

//ErrorHandler:
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message === "We're sorry, something went wrong.";
  }
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Hello from port 3000!');
});
