const express = require("express");
const serverless = require("serverless-http");
const app = express();


app.get("/users", async (req, res) => {
  const client = new MongoClient(uri);
  const userIds = JSON.parse(req.query.userIds);

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const pipeline = [
      {
        $match: {
          user_id: {
            $in: userIds,
          },
        },
      },
    ];
    // c'ets une pipeline d'intgration MongoDB qui est utilisé pour trouver les documents correspondants dans la collection 'users'. Le pipeline contient une seule étape $match, qui filtre les documents pour ne garder que ceux dont l'id utilisateur est dans le tableau de 'userIds'

    const foundUsers = await users.aggregate(pipeline).toArray();
    // éxécute le pipeline, convertit le résultat en tableau et stocke la valeur dans la variable foundUsers

    res.send(foundUsers);
    // envoie le tableau 'foundUsers' comme réponse à la requête HTTP
  } finally {
    await client.close();
    // ferme la connexion à la base de données MongoDB
  }
});

module.exports.handler = serverless(app);
