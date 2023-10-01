const { handler } = require("../../app");

handler.post("/signup", async (req, res) => {
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

module.exports.handler = serverless(app);
