const { handler, MongoClient, uuidv4, jwt, bcrypt, uri } = require("../../app");

handler.get("/gendered-users", async (req, res) => {
  const client = new MongoClient(uri);
  const gender = req.query.gender; // pourquoi query ?

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const query = { gender_identity: { $eq: gender } }; // ??
    const foundUsers = await users.find(query).toArray();
    res.json(foundUsers);
  } finally {
    await client.close();
  }
});