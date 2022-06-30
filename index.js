const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
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
        })
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
