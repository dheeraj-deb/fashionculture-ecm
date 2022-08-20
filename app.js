const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const nocache = require('nocache');
const flash = require('connect-flash');
const multer = require('multer');
const handlebars = require('handlebars')

const db = require('./util/database')

// user routes
const userRouter = require('./routes/user/index');
const user_auth = require('./routes/user/auth');

// admin routes
const admin_auth = require('./routes/admin/auth');
const adminRouter = require('./routes/admin/admin');


const MONGODB_URI = 'mongodb://localhost:27017';

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  helpers: {
    inc: function (value, options) {
      return parseInt(value) + 1
    }
  }, extname: 'hbs', defaultLayout: false, layoutsDir: __dirname + '/views/layout', partialsDir: __dirname + '/views/partials'
}));

handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
  var operators = {
    'eq': function (l, r) { return l == r; },
    'noteq': function (l, r) { return l != r; },
    'gt': function (l, r) { return Number(l) > Number(r); },
    'or': function (l, r) { return l || r; },
    'and': function (l, r) { return l && r; },
    '%': function (l, r) { return (l % r) === 0; }
  }
    , result = operators[operator](operand_1, operand_2);

  if (result) return options.fn(this);
  else return options.inverse(this);
});

// app.use(multer())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache())
db.connectDb((err) => {
  if (err) {
    console.log("connection err" + err);
  } else {
    console.log("db connected");
  }
})


app.use(session({
  secret: 'session secret', resave: false,
  store: store,
  saveUninitialized: false, cookie: {
    maxAge: 60000000
  }
}))

app.use(flash())


app.use(user_auth);
app.use('/', userRouter);

app.use('/admin/auth', admin_auth);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {

  if (err instanceof multer.MulterError) {

    if (err.code === "LIMIT_FILE_SIZE") {
      req.flash("error", "File is too large")
      return res.redirect('/admin/add-product')
    }
    else if (err.code === "LIMIT_FILE_COUNT") {
      req.flash("error", "File limit reached")
      return res.redirect('/admin/add-product')
    }
    else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      req.flash('error', "File must be an image")
      return res.redirect('/admin/add-product')
    }
  }


  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
