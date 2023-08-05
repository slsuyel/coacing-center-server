const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.37kn8jw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    const usersCollection = client.db("school-of-excellence").collection("users");
    const programsCollection = client.db("school-of-excellence").collection("programs");
    const teacherCollection = client.db("school-of-excellence").collection("teachers");

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/program", async (req, res) => {
      const program = req.body;
      const result = await programsCollection.insertOne(program);
      res.send(result);
    });

    app.get("/programs", async (req, res) => {
      const result = await programsCollection.find().toArray();
      res.send(result);
    });

    app.delete("/programs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await programsCollection.deleteOne(query);
      res.send(result);
    });
    /* teachers */
    app.post("/teacher", async (req, res) => {
      const teacher = req.body;
      const result = await teacherCollection.insertOne(teacher);
      res.send(result);
    });

    app.get("/teachers", async (req, res) => {
      const result = await teacherCollection.find().toArray();
      res.send(result);
    });

    app.delete("/teachers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teacherCollection.deleteOne(query);
      res.send(result);
    });



    // app.get('/user/:email', async (req, res) => {
    //   const email = req.params.email;
    //   try {
    //     const user = await usersCollection.findOne({ email: email });
    //     if (user) {
    //       res.json(user);
    //     } else {
    //       res.status(404).json({ message: 'User not found' });
    //     }
    //   } catch (error) {
    //     res.status(500).json({ message: 'Server error' });
    //   }
    // });


    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to server ");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});