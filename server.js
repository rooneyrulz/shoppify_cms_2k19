const express = require('express');
const { createServer } = require('http');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const logger = require('morgan');
const path = require('path');
const { config } = require('dotenv');
const stripe = require('stripe');

// IMPORT MONGO CONNECTION
const dbConnection = require('./config/database');

// IMPORT PASSPORT CONFIG
const passportConfig = require('./config/passport');

// IMPORT ROUTES
const home = require('./routes/api/home');
const dashboard = require('./routes/api/dashboard');
const register = require('./routes/api/user');
const auth = require('./routes/api/auth');
const item = require('./routes/api/item');
const cart = require('./routes/api/cart');
const profile = require('./routes/api/profile');

const app = express();
const server = createServer(app);

if (process.env.NODE_ENV === 'development') config();

if (process.env.NODE_ENV === 'development')
  stripe.sePublishableKey(process.env.STRIPE_PUBLISHABLE_KEY);

mongoose.Promise = global.Promise;

// EXECUTE MONGO CONNECTION
dbConnection();

if (process.env.NODE_ENV === 'development') app.use(logger('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/items/public', express.static(path.join(__dirname, 'public')));
app.use('/user/public', express.static(path.join(__dirname, 'public')));
app.use(
  '/user/profiles/public',
  express.static(path.join(__dirname, 'public'))
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// EXPRESS SESSION MIDDLEWARE
app.use(
  session({
    secret: 'your secret',
    resave: true,
    saveUninitialized: true
  })
);

// EXPRESS FLASH MIDDLEWARE
app.use(flash());

// EXPRESS CUSTOM MESSAGES MIDDLEWARE
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

passportConfig(passport);

// PASSPORT MIDDLEWARES
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.authUser = req.user || null;
  next();
});

app.use((req, res, next) => {
  req.header('Access-Control-Allow-Origin', '*');
  req.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    req.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    return res.status(200).json({});
  }

  next();
});

app.use('/', home);
app.use('/dashboard', dashboard);
app.use('/user', register);
app.use('/user', auth);
app.use('/items', item);
app.use('/cart', cart);
app.use('/user/profiles', profile);

app.use((req, res, next) =>
  res.status(404).render('error', { title: 'Page Not Found!', status: 404 })
);

server.listen(process.env.PORT || 5000, () =>
  console.log(`server running on port ${process.env.PORT || 5000}...`)
);
