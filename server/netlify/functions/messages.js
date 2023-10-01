const { handler } = require("../../app");

handler.get("/messages", async (req, res) => {
  const { userId, correspondingUserId } = req.query;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("app-data");
    const messages = database.collection("messages");

    const query = {
      from_userId: userId,
      to_userId: correspondingUserId,
    };

    const foundMessages = await messages.find(query).toArray();
    res.send(foundMessages);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});
