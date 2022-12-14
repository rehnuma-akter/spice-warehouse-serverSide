const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000; 

//Using the Middleware ---
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
        return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3ms5ct.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run (){
    try{
        await client.connect();
        const spicesCollection = client.db("spicesCollection").collection("spices");

         // AUTH
        app.post("/login", async (req, res) => {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });
        res.send({ accessToken });
        });

        //Fetching all the spices
        app.get("/spices", async (req, res) =>{
            const query = {};
            const spices = await spicesCollection.find(query).toArray();
            res.send(spices);
        });

        // Fetching spice via id
        app.get("/spices/:id", async (req, res) => {
        const spiceId = req.params.id;
        const query = { _id: ObjectId(spiceId) };
        const spice = await spicesCollection.findOne(query);
        res.send(spice);
        });
        
        //Adding one spice
        app.post("/spices", async(req, res) => {
            const spice = req.body;
            const newSpice = await spicesCollection.insertOne(spice);
            res.send(newSpice);
        });

        //updating one spice
        app.put("/spices/:id", async (req, res) =>{
            const spiceId = req.params.id;
            const spice = req.body;
            const query = { _id: ObjectId(spiceId) };
            const updatedSpice = await spicesCollection.updateOne(query, { $set: spice });
            res.send(updatedSpice);
        });

        //Delete one spice
        app.delete("/spices/:id", async (req, res) => {
            const spiceId = req.params.id;
            const query = { _id: ObjectId(spiceId) };
            const deletedSpice = await spicesCollection.deleteOne(query);
            res.send(deletedSpice);
        });

        app.get("/myItems", verifyJWT, async (req, res) => {
        const decodedEmail = req.decoded.email;
        const email = req.query.email;
        if (email === decodedEmail) {
            const myItems = await spicesCollection.find({ email: email }).toArray();
            res.send(myItems);
        } else {
            res.status(403).send({ message: "forbidden access" });
        }
        });

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello Server Side");
});

app.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
});
