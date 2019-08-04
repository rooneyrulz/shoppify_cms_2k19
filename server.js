import express from 'express';
import { createServer } from 'http';
import exphbs from 'express-handlebars';
import flash from 'connect-flash';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import logger from 'morgan';
import path from 'path';

// IMPORT MONGO CONNECTION
import dbConnection from './config/database';

// IMPORT PASSPORT CONFIG
import passportConfig from './config/passport';

// IMPORT ROUTES
import home from './routes/api/home';
import dashboard from './routes/api/dashboard';
import register from './routes/api/user';
import login from './routes/api/login';
import item from './routes/api/item';

const app = express();
const server = createServer(app);

mongoose.Promise = global.Promise;

// EXECUTE MONGO CONNECTION
dbConnection();

app.use(logger('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

passportConfig(passport);

// PASSPORT MIDDLEWARES
app.use(passport.initialize());
app.use(passport.session());

// EXPRESS SESSION MIDDLEWARE
app.use(
  session({
    secret: 'your secret',
    resave: true,
    saveUninitialized: true,
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

app.get('/', (req, res, next) => res.redirect('/home'));
app.use('/home', home);
app.use('/dashboard', dashboard);
app.use('/user', register);
app.use('/user', login);
app.use('/items', item);

server.listen(process.env.PORT || 5000, () =>
  console.log(`server running on port ${process.env.PORT || 5000}`)
);
