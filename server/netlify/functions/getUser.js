const { handler } = require("../../app");

handler.get("/user", authenticateToken, async (req, res) => {
  const client = new MongoClient(uri);
  const userId = req.query.userId;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const query = { user_id: userId };
    const user = await users.findOne(query);
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Une erreur s'est produite`);
  } finally {
    await client.close();
  }
});

module.exports.handler = serverless(app);
