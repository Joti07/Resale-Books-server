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

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const categories = client.db('recycled_books').collection('categories');
        const books = client.db('recycled_books').collection('books');
        const booksDetails = client.db('recycled_books').collection('booksDetails');
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
        //all books
        app.get('/books', async (req, res) => {
            const query = {};
            const options = await books.find(query).toArray();
            res.send(options);
        });
        // app.post('/allbooks', async (req, res) => {
        //     const books = req.body;
        //     const result = await books.insertOne(books);
        //     res.send(result);
        // });
        app.post('/books', async (req, res) => {
            const books = req.body;
            const result = await booksDetails.insertOne(books);
            res.send(result);
        });
        //my books
        app.get('/books/:email', async (req, res) => {
            const email = req.params.email;
            const query = {}
            const books = await booksDetails.find(query);
            const myBooks = books.filter(n => n.seller_email === email);
            // console.log(books)
            res.send(myBooks);
        })
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

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        });
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        })
        //buyers
        app.get('/users/buyers', async (req, res) => {
            const query = {};
            const options = await userCollection.find(query).toArray();
            const buyers = options.filter(n => n.role === 'buyer');
            // console.log(role);
            res.send(buyers);
        });

        //sellers
        app.get('/users/sellers', async (req, res) => {
            const query = {};
            const options = await userCollection.find(query).toArray();
            const buyers = options.filter(n => n.role === 'seller');
            // console.log(role);
            res.send(buyers);
        });
        //check admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        // //check buyer
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        })
        // //check seller
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })


    }
    finally { }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('recycle books server is running');
})

app.listen(port, () => console.log(`recycle books portal running on ${port}`))