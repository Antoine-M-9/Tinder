const express = require("express");
const serverless = require("serverless-http");
const app = express();


app.put("/user", async (req, res) => {
  const client = new MongoClient(uri);
  const formData = req.body.formData;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const query = { user_id: formData.user_id };
    const updateDocument = {
      $set: {
        first_name: formData.first_name,
        dob_day: formData.dob_day,
        dob_month: formData.dob_month,
        dob_year: formData.dob_year,
        show_gender: formData.show_gender,
        gender_identity: formData.gender_identity,
        gender_interest: formData.gender_interest,
        url: formData.url,
        about: formData.about,
        matches: formData.matches,
      },
    };

    const insertedUser = await users.updateOne(query, updateDocument);
    res.json(insertedUser);
  } catch (error) {
    // Cette ligne envoie une réponse d'erreur au client avec le message d'erreur.
    res.status(500).json({ error: error.toString() });
  } finally {
    await client.close();
  }
});

module.exports.handler = serverless(app);
