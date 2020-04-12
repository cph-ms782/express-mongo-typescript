// npm install tsscmp express fs-extra cors winston express-winston basic-auth // https://www.npmjs.com/package/passport is an alternativ
// npm i @types/node
// npm install chai mochai -D

require('dotenv').config();
import express from "express";
const cors = require('cors')
import path from "path";
import { ApiError } from "./errors/apiError";
// const simpleLogger = require('./middlewares/simpleLogger');
const logger = require('./middlewares/logger');
// const myCORS = require('./middlewares/my-cors');
const winston = require('winston');
const expressWinston = require('express-winston');

const app = express();

// app.use(myCORS);
app.use(cors());

logger.log({
  level: 'info',
  message: 'Hello distributed log files!'
});
app.use(express.static(path.join(process.cwd(), "public")))
app.use(express.json())

let userAPIRouter = require('./routes/userApi');

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req: any, res: any) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

app.use("/api/users", userAPIRouter);

app.get("/api/dummy", (req, res) => {
  logger.info('Hello again distributed logs');
  res.json({ msg: "Hello" })
})

app.use(function (req, res, next) {
  if (req.originalUrl.startsWith('/api')) {
    throw new ApiError('This API does not contain this endpoint');
    res.status(404).json({ code: 400, msg: 'This API does not contain this endpoint' }); // eller lav sin egen error
  }
  next();
});

app.use(function (err: any, req: any, res: any, next: Function) {
  if ((err.name = 'ApiError')) {
    res.status(err.errorCode).json(err);
  }
  logger.log('error', 'Important error: ', err);
  next(err);
});

const PORT = process.env.PORT || 3333;
const server = app.listen(PORT)
console.log(`Server started, listening on port: ${PORT}`)
module.exports.server = server;


// ***************
// Allows for JSON logging
// ***************

// logger.log({
//     level: 'info',
//     message: 'Pass an object and this works',
//     additional: 'properties',
//     are: 'passed along'
// });

// logger.info({
//     message: 'Use a helper method if you want',
//     additional: 'properties',
//     are: 'passed along'
// });

// // ***************
// // Allows for parameter-based logging
// // ***************

// logger.log('info', 'Pass a message and this works', {
//     additional: 'properties',
//     are: 'passed along'
// });

// logger.info('Use a helper method if you want', {
//     additional: 'properties',
//     are: 'passed along'
// });

// // ***************
// // Allows for string interpolation
// // ***************

// // info: test message my string {}
// logger.log('info', 'test message %s', 'my string');

// // info: test message my 123 {}
// logger.log('info', 'test message %d', 123);

// // info: test message first second {number: 123}
// logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });

// // prints "Found error at %s"
// logger.info('Found %s at %s', 'error', new Date());
// logger.info('Found %s at %s', 'error', new Error('chill winston'));
// logger.info('Found %s at %s', 'error', /WUT/);
// logger.info('Found %s at %s', 'error', true);
// logger.info('Found %s at %s', 'error', 100.00);
// logger.info('Found %s at %s', 'error', ['1, 2, 3']);

// // ***************
// // Allows for logging Error instances
// // ***************

// logger.warn(new Error('Error passed as info'));
// logger.log('error', new Error('Error passed as message'));

// logger.warn('Maybe important error: ', new Error('Error passed as meta'));
// logger.log('error', 'Important error: ', new Error('Error passed as meta'));

// logger.error(new Error('Error as info'));
