const { handler, MongoClient, uuidv4, jwt, bcrypt, uri } = require("../../app");

handler.put("/addmatch", async (req, res) => {
  const client = new MongoClient(uri);
  const { userId, matchedUserId } = req.body;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const user = await users.findOne({
      user_id: userId,
      "matches.user_id": matchedUserId,
    });
    if (user) {
      return res.status(400).send("Match already exists");
    }

    const query = { user_id: userId };
    const updateDocument = {
      $push: { matches: { user_id: matchedUserId } },
    };
    const result = await users.updateOne(query, updateDocument);
    res.json(result);
  } finally {
    await client.close();
  }
});

