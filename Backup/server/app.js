var createError = require('http-errors');
var compression = require('compression');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');

// view engine setup
app.use(bodyParser.json({ limit: '30mb', extended: true }))    // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true, parameterLimit: 1000000 }));
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view cache', true);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.send('Welcome to Station99ai Staging!'));


app.use('/api', require('./api'));

app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
