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
  //console.log(req.body.url);
  console.log(req.body);
  console.log(dns.lookup(req.body.url), (err)=>{console.error(err)});
  dns.lookup(req.body.url, (err) => {
    err != null
      ? res.json({  error: 'invalid url'})
      : CreateShortURL(req.body.url, res);
    //store url after validating
  });
});

CreateShortURL = async (full_url, resp) => {
  let count = await ShortUrl.countDocuments({});
  console.log("# of Docs: " + count);
  ShortUrl.create({ urlID: count, fullURL: full_url }, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(
        "original URL: " + full_url + " <> short URL: /api/shorturl/" + count
      );
      return resp.json({
        original_url: full_url,
        short_url: count,
      });
    }
  });
};

RetrieveOrignalURL = (shortUrlId) => {
  ShortUrl.find({ urlID: shortUrlId }).exec((err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Go to: " + data[0].fullURL);

      return data[0].fullURL;
    }
  });
};

app.get("/api/shorturl/:uriID", function (req, res) {
  
  console.log(req.params)
  if(req.params.uriID == 'undefined'){res.redirect(req.headers.host);}
  else{res.redirect(RetrieveOrignalURL(req.params.uriID));}
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

exports.CreateShortURL = this.CreateShortURL;
exports.RetrieveOrignalURL = RetrieveOrignalURL;
