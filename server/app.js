const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const uri = process.env.URI;

const app = express();
app.use(
  cors({
    origin: "https://peppy-sable-43e859.netlify.app", // Remplacez ceci par l'URL de votre client
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

module.exports = {
  handler: serverless(app),
  app,
  MongoClient,
  uuidv4,
  jwt,
  bcrypt,
  uri,
};
