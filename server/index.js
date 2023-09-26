const PORT = 8000;

const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const uri =
  "mongodb+srv://new:mypassword@cluster0.exf2bb2.mongodb.net/?retryWrites=true&w=majority";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello to my app");
});

app.post("/signup", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;

  const generateduserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).send("user already exist. Please login");
    }

    const sanitiziedEmail = email.toLowerCase();

    const data = {
      user_id: generateduserId,
      email: sanitiziedEmail,
      hashed_password: hashedPassword,
    }; // créer un objet contenant les informations de l'utilisateur à insérer dans la base de données

    const insertedUser = await users.insertOne(data); // insert le nouvel utilisateur dans la collection 'users' de la base de données

    const token = jwt.sign(insertedUser, sanitiziedEmail, {
      expiresIn: 60 * 24,
    }); // génère un token pour l'utilisateur

    res.status(201).json({ token, userId: generateduserId });
  } catch (err) {
    console.log(err);
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
      const token = jwt.sign(user, email, {
        expiresIn: 60 * 24,
      });
      res.status(201).json({ token, userId: user.user_id });
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/user", async (req, res) => {
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

app.get("/gendered-users", async (req, res) => {
  const client = new MongoClient(uri);
  const gender = req.query.gender; // pourquoi query ?

  console.log("gender", gender);

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const query = { gender_identity: { $eq: gender } }; // ??
    const foundUsers = await users.find(query).toArray();
    res.send(foundUsers);
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
    res.send(insertedUser);
  } finally {
    await client.close();
  }
});

app.put('/addmatch', async (req, res) => {
  const client = new MongoClient(uri)
  const { userId, matchedUserId } = req.body

  try {
    await client.connect();
    const database = client.db('app-data');
    const users = database.collection('users');

    const query = {user_id: userId}
    const updateDocument = {
      $push: { matches: { user_id: matchedUserId }},
    }
    const user = await users.updateOne(query, updateDocument);
    res.send(user)
  } finally {
    await client.close();
  }
})

app.listen(PORT, () => console.log("Server running on PORT " + PORT));
