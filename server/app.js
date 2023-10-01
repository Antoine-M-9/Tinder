const express = require('express');
const serverless = require('serverless-http');
const cors = require("cors");
const app = express();
app.use(cors());

// Ajoutez le middleware CORS ici

module.exports.handler = serverless(app);