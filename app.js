const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const api = require('./src/routes');
let resResult = require('./src/common/resResult');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', api);

app.use(function(req, res) {
  res.status(404).send(resResult(false,404, "api를 찾을 수 없습니다.", ""));
});

module.exports = app;
