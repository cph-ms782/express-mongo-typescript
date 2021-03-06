// npm i @types/node @types/winston
// npm install @types/node-fetch @types/node @types/mongodb @types/bcryptjs @types/chai @types/express @types/mocha --save-dev
// npm install chai mocha node-fetch nodemon ts-node --save-dev
// npm install winston tsscmp mongodb geojson-utils express express-winston basic-auth helmet bcryptjs concurrently dotenv debug typescript  --save
// npm install express-graphql graphql
// npm install @types/graphql @types/express-graphql --save-dev
// npm install cors
// npm install @types/cors
// npm install @types/cors --save-dev


require('dotenv').config();
import express from "express";
import path from "path";
import { ApiError } from "./errors/apiError";
import cors from "cors"
const helmet = require('helmet')

const app = express()

app.use(cors())

app.use(helmet())

app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.json());

let userAPIRouter = require('./routes/userApiDB');
let gameAPIRouter = require('./routes/gameApi');
let graphQLRouter = require('./routes/graphQLAPI');

app.get("/api/dummy", (req, res) => {
  res.json({ msg: "Hello api" })
});

app.get("/gameapi/dummy", (req, res) => {
  res.json({ msg: "Hello gameapi" })
});

app.use("/api/users", userAPIRouter);
app.use("/gameapi", gameAPIRouter);
app.use("/graphql", graphQLRouter);

app.use(function (req, res, next) {
  if (req.originalUrl.startsWith("/api")) {
    res.status(404).json({ code: 404, msg: "this API does not contain this endpoint" })
  }
  next();
});

app.use(function (req, res, next) {
  if (req.originalUrl.startsWith("/gameapi")) {
    res.status(404).json({ code: 404, msg: "this API does not contain this endpoint" })
  }
  next();
});

app.use(function (err: any, req: any, res: any, next: Function) {
  if (err instanceof (ApiError)) {
    const e = <ApiError>err;
    res.status(e.errorCode).send({ code: e.errorCode, message: e.message });
  }
  next(err);
});

const PORT = process.env.PORT || 3333;
const server = app.listen(PORT)
console.log(`Server started, listening on port: ${PORT}`)
module.exports.server = server;


