require("dotenv").config();
const express = require("express")
const app = express()
const PORT = 8080
const credentials = require('./middleware/credentials');
const corsOptions = require('./config/corsOption');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const admin = require('./routes/admin')
const payments = require('./routes/payments')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')

//connects to mongoDB
connectDB()

const Product = require('./model/Product')

//middleware
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//admin route
app.use(admin)
//payment routes
app.use(payments)



app.get('/', async (req,res)=>{
    try {
        console.log("pinged")
        const products = await Product.find({})
        res.status(200).json(products)
    } catch (error) {
        console.log(error)
    }
    
})



app.all("*",(req,res)=>{
    res.status(404).send("Not found")
})

//connecting to the database
mongoose.connection.once('open', ()=>{
    //starting the server
    app.listen(PORT, ()=>{
        console.log(`The Server is running on port : ${PORT}`);
    })
})


