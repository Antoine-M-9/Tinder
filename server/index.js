const PORT = 8000;

const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const uri = process.env.URI;

const app = express();
app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("Erreur : Aucun token fourni");
    return res.sendStatus(401); // if there isn't any token
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Erreur lors de la vérification du token :", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}

app.get("/protected-route", authenticateToken, (req, res) => {
  // now we have access to the protected route
});

async function createIndexes() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("app-data");

    const users = database.collection("users");
    await users.createIndex({ user_id: 1 });

    // Ajoutez ici d'autres index si nécessaire
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

createIndexes();

app.post("/signup", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;

  // Vérifier si l'email est valide
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email");
  }

  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const sanitizedEmail = email.toLowerCase();

    const data = {
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
    }; // créer un objet contenant les informations de l'utilisateur à insérer dans la base de données

    const insertedUser = await users.insertOne(data); // insert le nouvel utilisateur dans la collection 'users' de la base de données

    const token = jwt.sign(insertedUser, process.env.SECRET_KEY, {
      expiresIn: 60 * 24,
    }); // génère un token pour l'utilisateur

    res.status(201).json({ token, userId: generatedUserId });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

app.post("/login", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const user = await users.findOne({ email });

    const correctPassword = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (user && correctPassword) {
      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: 60 * 24,
      });
      res.status(201).json({ token, userId: user.user_id });
    } else {
      res.status(400).json("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

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

app.get("/user", authenticateToken, async (req, res) => {
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

app.get("/gendered-users", async (req, res) => {
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

app.get("/messages", async (req, res) => {
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

app.put("/addmatch", async (req, res) => {
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

app.listen(PORT, () => console.log("Server running on PORT " + PORT));
