const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const port = 5000;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbname = process.env.DB_NAME;
const productTbl = process.env.DB_PRODUCT_TBL;
const orderTbl = process.env.DB_ORDER_TBL;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
const uri = `mongodb+srv://${user}:${password}@cluster0.ou4zy.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => res.send("backend working"));

client.connect(err => {
    const productCollection = client.db(dbname).collection(productTbl);
    const orderCollection = client.db(dbname).collection(orderTbl);
    // perform actions on the collection object
    app.post('/addProduct', (req, res) => {
        const products = req.body;
        productCollection.insertMany(products)
            .then(result => res.send(result.insertedCount > 0));
    });

    app.get('/getAllProducts', (req, res) => {
        productCollection.aggregate([{ $sample: { size: 20 } }])
            .toArray((err, document) => res.send(document));
    });

    app.post('/getProductsByKeys', (req, res) => {
        const productKeys = req.body;
        productCollection.find({ key: { $in: productKeys } })
            .toArray((err, document) => res.send(document))
    });

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
            .then(result => res.send(result.insertedCount > 0));
    });

});


app.listen(process.env.PORT || port);