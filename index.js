const express = require('express');
const cors = require('cors');
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


// run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('recycle books server is running');
})

app.listen(port, () => console.log(`recycle books portal running on ${port}`))