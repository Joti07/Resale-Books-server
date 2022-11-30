const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijmmtxg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categories = client.db('recycled_books').collection('categories');
        const books = client.db('recycled_books').collection('books');
        const userCollection = client.db('recycled_books').collection('users');
        // Use Aggregate to query multiple collection and then merge data
        app.get('/categories', async (req, res) => {
            const query = {};
            const options = await categories.find(query).toArray();

            // // get the bookings of the provided date
            // const bookingQuery = { appointmentDate: date }
            // const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

            // // code carefully :D
            // options.forEach(option => {
            //     const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
            //     const bookedSlots = optionBooked.map(book => book.slot);
            //     const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
            //     option.slots = remainingSlots;
            // })
            res.send(options);
        });
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = {};
            const options = await books.find(query).toArray();
            const category_books = options.filter(n => n.category_id === id);
            console.log(id);
            res.send(category_books);
        });
        app.get('/books', async (req, res) => {
            const query = {};
            const options = await books.find(query).toArray();
            res.send(options);
        });
        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const book = await books.findOne(query);
            res.send(book);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            console.log(user);
            res.status(403).send({ accessToken: 'token' })
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });


    }
    finally { }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('recycle books server is running');
})

app.listen(port, () => console.log(`recycle books portal running on ${port}`))