const path = require("path");
require("dotenv").config({ path: __dirname + "/process.env" });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const dns = require("dns");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const dbConnection = mongoose.connection;
dbConnection.once("open", () => {
  console.log("connected!!!");
});

let ShortUrlSchema = mongoose.Schema({
  urlID: { type: Number, required: true },
  fullURL: { type: String, required: true },
});

let ShortUrl = mongoose.model("ShortUrl", ShortUrlSchema);

CreateShortURL = (original_url) => {
  // mongoose.connect(process.env.MONGO_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });
  // let dbConn = mongoose.connection;
  // //dbConn.on("open", () => console.log("Database open"));
  // //dbConn.on("close", () => Console.log("Database closed"));
  let res = 999;
  // dbConn.once("open", () => {
  //   console.log("connected");
  // });
  // //{
  // //dbConn.on("open", () => console.log("connected"));
  // //dbConn.useDb("test");
  // //console.log("connected");
  // // console.log(dbConn.db.databaseName);
  // // console.log(dbConn.collections);
  // // ShortUrl.createCollection().then(
  // //   console.log("Collection is created? check!!")
  // // );
  // // console.log(dbConn.collections);
  // // console.log("new Collection? " + dbConn.collection("short_urls"));

  // //console.log(dbConn.collection("shorturls"));
  // //.countDocuments().exec());
  // //res = dbConn.collection("shorturls").countDocuments();
  var count = ShortUrl.countDocuments({}, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log("# of Docs:" + data);
      count = data;
    }
  });
  ShortUrl.create({
    urlID: count,
    fullURL: original_url,
  });
  // //});
  // dbConn.on("close", () => Console.log("Database closed"));
  // dbConn.close();

  return "/api/shorturl/" + count;
};

RetrieveOrignalURL = (shortUrlId) => {
  dbConn.open();
  dbConn.useDb();
  let res = ShortUrl.find({ urlID: shortUrlId }).urlID;
  dbConn.close();
  return res;
};
//mongoose.connection.close();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  dns.lookup(req.body.url, (err, addr, fam) => {
    err != null
      ? res.json({ status: "invalid" })
      : res.json({
          original_url: req.body.url,
          short_url: CreateShortURL(req.body.url),
        });
    //store url after validating
  });
});

app.get("/api/shorturl/:uriID", function (req, res) {
  replace(RetrieveOrignalURL(req.params.uriID));
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
