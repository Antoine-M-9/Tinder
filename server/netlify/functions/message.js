const express = require("express");
const serverless = require("serverless-http");
const app = express();


app.post("/message", async (req, res) => {
  const client = new MongoClient(uri);
  const message = req.body.message;

  try {
    await client.connect();
    const database = client.db("app-data");
    const messages = database.collection("messages");
    const insertedMessage = await messages.insertOne(message);
    res.send(insertedMessage);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

module.exports.handler = serverless(app);
