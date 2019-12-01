'use strict';
const express = require('express');
const app = express();
const {
  verifyOtp,
  sendOtp,
  resendOtp
} = require('../stubs');

app.post('/', (req, res) => {
  res.status(200).send(sendOtp);
});

app.post('/verify', (req, res) => {
  res.status(200).send(verifyOtp);
});

app.post('/retry', (req, res) => {
  res.status(200).send(resendOtp);
});

module.exports = app;
