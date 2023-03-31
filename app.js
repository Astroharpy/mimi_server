require("dotenv").config();
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000
const credentials = require('./middleware/credentials');
const corsOptions = require('./config/corsOption');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const admin = require('./routes/admin')
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

//Home route
// app.get('/',(req,res)=>{
//     res.status(200).json( [
//         {price:100,name:"first"},
//         {price:100,name:"second"},
//         {price:100,name:"third"},
//         {price:100,name:"fourth"},
//         {price:100,name:"fifth"},
//         {price:100,name:"sixth"},
//         {price:100,name:"seventh"},
//         {price:100,name:"eighth"},
//         {price:100,name:"ninth"},
//         {price:100,name:"tenth"}
    
//         ])
// })

app.get('/', async (req,res)=>{
    try {
        const products = await Product.find({})
        res.status(200).json(products)
    } catch (error) {
        
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


