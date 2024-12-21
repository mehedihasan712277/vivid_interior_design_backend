const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path")

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// multer----------------------
const UPLOADS_FOLDER = "./uploads/"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER)
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-") + "-" + Date.now();
        cb(null, fileName + fileExt);
    }
})

const upload = multer({
    //dest: UPLOADS_FOLDER,
    storage: storage,
    limits: {
        fileSize: 1000000 // 1mb
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/gif" || file.mimetype === "image/png") {
            cb(null, true)
        }
        else {
            cb(new Error("Invalid file type. Only jpg and png are allowed"))
            //cd(null, false) // to handle silently 
        }
    },
})

app.use("/uploads", express.static(path.join(__dirname, "uploads")));



//middleware
app.use(cors());
app.use(express.json());


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
        const serviceDb = client.db("vividInteriorDB").collection("service");
        const blogDb = client.db("vividInteriorDB").collection("blog");
        const categoryDb = client.db("vividInteriorDB").collection("category");

        app.get("/", (req, res) => {
            res.send("Setup is ok")
        })


        // handle service------------------
        app.get("/service", async (req, res) => {
            const result = await serviceDb.find().toArray();
            res.send(result);
        })

        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await serviceDb.findOne(filter);
            res.send(result);
        })

        app.post("/service", async (req, res) => {
            const serviceData = req.body;
            const result = await serviceDb.insertOne(serviceData);
            res.send(result);
        })

        app.delete("/service/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await serviceDb.deleteOne(filter);
            res.send(result);
        })

        // handle file upload-----------------
        app.post("/", upload.single("avatar"), (req, res) => {
            res.send("hello world");
        })

        //error handling---------------
        app.use((err, req, res, next) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    res.status(500).send("There was an upload error")
                }
                else {
                    res.status(500).send(err.message)
                }
            }
            else {
                res.send("success")
            }
        })
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