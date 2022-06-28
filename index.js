const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//Using the Middleware ---
app.use(cors());
app.use(express.json());



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
        const spices = {name:'oregano', price: '23' };
        const result = await spicesCollection.insertOne(spices);
        console.log(`user inserted with id: ${result.insertedId}`);
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
