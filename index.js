const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");

const SSLCommerzPayment = require('sslcommerz-lts')


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

const store_id = 'schoo64cf3837257cc'
const store_passwd = 'schoo64cf3837257cc@ssl'
const is_live = false //true for live, false for sandbox


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    const usersCollection = client.db("school-of-excellence").collection("users");
    const programsCollection = client.db("school-of-excellence").collection("programs");
    const orderCollection = client.db("school-of-excellence").collection("orders");
    const teacherCollection = client.db("school-of-excellence").collection("teachers");
    const successCollection = client.db("school-of-excellence").collection("success");

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


    /* programs */
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

    /* success */
    app.post("/success", async (req, res) => {
      const successStory = req.body;
      const result = await successCollection.insertOne(successStory);
      res.send(result);
    });

    app.get("/success", async (req, res) => {
      const result = await successCollection.find().limit(4).toArray();
      res.send(result);
    });

    app.delete("/success/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await successCollection.deleteOne(query);
      res.send(result);
    });

    /*  */
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    /* ssl */
    const banglaToEnglishNumerals = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const transId = new ObjectId().toString()
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const program = await programsCollection.findOne({ _id: new ObjectId(order.programId) });
      const banglaPrice = program.price;
      const mainPrice = banglaPrice.replace(/[০-৯]/g, match => banglaToEnglishNumerals[match]);

      const data = {
        total_amount: mainPrice,
        currency: 'BDT',
        tran_id: transId, // use unique tran_id for each api call
        success_url: `https://excellence-server.vercel.app/payment/success/${transId}`,
        fail_url: `https://excellence-server.vercel.app/payment/fail/${transId}`,
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: order.email,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };
      // console.log(data);
      // const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
      // sslcz.init(data).then(apiResponse => {
      //   // Redirect the user to payment gateway
      //   let GatewayPageURL = apiResponse.GatewayPageURL
      //   res.send({ url: GatewayPageURL })

      //   const finalOrder = {
      //     price: mainPrice,
      //     order,
      //     status: false,
      //     transactionId: transId
      //   }
      //   const result =  orderCollection.insertOne(finalOrder)
      //   console.log(result);
      //   //  console.log('Redirecting to: ', GatewayPageURL)
      // });
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

      (async () => {
        try {
          const apiResponse = await sslcz.init(data);

          // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL;
          res.send({ url: GatewayPageURL });

          const finalOrder = {
            price: mainPrice,
            order,
            status: false,
            transactionId: transId,
          };

          const result = await orderCollection.insertOne(finalOrder);
          // console.log(result);

          // Uncomment this line if you want to log the redirection URL
          // console.log('Redirecting to: ', GatewayPageURL);
        } catch (error) {
          console.error('An error occurred:', error);
          // Handle the error as needed
        }
      })();



      app.post("/payment/success/:transId", async (req, res) => {
        const result = await orderCollection.updateOne({ transactionId: req.params.transId }, {
          $set: {
            status: true
          }
        }
        )
        if (result.modifiedCount > 0) {
          res.redirect(`https://schooloe.netlify.app/payment/success/:${req.params.transId}`)
        }
      });
      app.post("/payment/fail/:transId", async (req, res) => {
        const result = await orderCollection.deleteOne({ transactionId: req.params.transId })
        if (result.deletedCount) {
          res.redirect(`https://schooloe.netlify.app/payment/fail/:${req.params.transId}`)
        }
      })

    });

    /*all orders */
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({ status: true }).toArray()
      res.send(result)
    })
    /*  */
    app.get("/myorders/:email", async (req, res) => {
      const userEmail = req.params.email
      const result = await orderCollection.find({ "order.email": userEmail, status: true }).toArray();
      res.send(result)
    })


    /*  */
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