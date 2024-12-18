const express = require('express');
const cors = require('cors');
const multer = require('multer')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


// multer ====================
const UPLOADS_FOLDER = "./uploads/"

let upload = multer({
    dest: UPLOADS_FOLDER
})



const uri = `mongodb+srv://${process.env.DB_USR}:${process.env.DB_PASS}@cluster0.nsm7k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        const serviceDb = client.db("vividInteriorDb").collection("service");
        const blogDb = client.db("vividInteriorDb").collection("blog");
        const categoryDb = client.db("vividInteriorDb").collection("category");

        app.get("/", (req, res) => {
            res.send("Setup is ok")
        })

        // for multer testing--------------
        // app.post("/", upload.single("avatar"), (req, res) => {
        //     res.send("hello world");
        // })


        app.get("/service", async (req, res) => {
            const result = await serviceDb.find().toArray();
            res.send(result);
        })

        app.post("/service", async (req, res) => {
            const serviceData = req.body;
            const result = await serviceDb.insertOne(serviceData);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`the app is running on port ${port}`);
})