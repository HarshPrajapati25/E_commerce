const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // http req,res
const morgan = require('morgan'); // http req,res
const mongoose = require('mongoose'); 
const cors = require('cors'); //for frontend
require('dotenv/config');  //env file required
const authJwt=require("./helpers/jwt")
const error_handler=require('./helpers/error_handler')

app.use(cors());
app.options('*', cors())

//middleware 
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(error_handler)
     
//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products'); 
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const inCartsRoutes=require('./routes/inCarts')
 
const api = process.env.API_URL;
 
app.use(`${api}/categories`, categoriesRoutes);      
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/inCarts`,inCartsRoutes)

//Database
mongoose.connect(process.env.CONNECTION_STRING).then(()=>{
    console.log('Database Connection is ready...')
}).catch((err)=> {console.log(err)});

//Server
app.listen(3010, ()=>{
    console.log('server is running http://localhost:3010');
}) 




