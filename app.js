const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const { restart } = require('nodemon');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require('dotenv/config'); // allow to take the variables from .env

app.use(cors());
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler); // don't function well

const api = process.env.API_URL;

// Routers
const categoriesRouter = require('./routers/categories');
const productsRouter = require('./routers/products');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');

app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

// Database
mongoose.connect(process.env.CONNECTION_DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME
})
.then(()=> {
    console.log('Database connection is ready...');
})
.catch((err)=> {
    console.log(err);
})

const PORT = process.env.PORT || 3000

// Server
app.listen(PORT, ()=>{
    console.log('Server is running at http://localhost:3000');
})
