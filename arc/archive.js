require("dotenv").config();
const express = require("express")
const app = express()
const PORT = process.env.PORT || 8000
const credentials = require('./middleware/credentials');
const corsOptions = require('./config/corsOption');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')

//connects to mongoDB
connectDB()

app.use(credentials);
app.use(cors(corsOptions));

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const registerController = require("./controllers/registerController")
const authController = require("./controllers/authController")
const verifyJwT = require("./middleware/verifyJWT")
const verifyAdress = require('./middleware/verifyAdress')
const productsDb = require('./model/products.json')
const adressController = require('./controllers/adressController')

app.get('/',(req,res)=>{
    res.status(200).json(productsDb)
})
app.post('/test',(req,res)=>res.json({"success":"success"}))
app.post("/register", registerController )
app.post("/login", authController)

app.get('data',(req,res)=>{
    res.json({ice: "The great king of falcon"})
})
app.get("/get-data", verifyJwT ,(req, res)=>{
    //the req object can be given data through the verify token
    // log(req.cart)
    res.json({"name":"bongani", "age":24, "employment":"self-employed"})
})
app.get('/customer-details', verifyJwT, verifyAdress , async (req, res)=>{
    res.json({isAdress: req.isAdress});
})
app.post('/customer-details', verifyJwT, adressController)



//upload to admin section
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const ImageKit = require("imagekit");
const fs = require('fs');

const imagekit = new ImageKit({
    publicKey : process.env.PUBLIC_KEY,
    privateKey : process.env.PRIVATE_KEY,
    urlEndpoint : process.env.ENDPOINT
});

app.get('/test/upload', async(req, res)=>{
    
})

app.get('/admin/upload',async (req, res)=>{
    res.send(` <form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="avatar" /><button type='submit'>submit</button></form>`)
})
app.post('/upload',upload.single('avatar'), async (req, res) =>{


    
    fs.readFile('./uploads/test.jpg', function(err, data) {
        if (err) throw err; // Fail if the file can't be read.
        imagekit.upload({
          file : data, //required
          fileName : "test.jpg", //required
          tags: ["tag1", "tag2"]
        }, function(error, result) {
          if(error) console.log(error);
          else console.log(result);
        });
      });
})



app.all("*",(req,res)=>{
    res.status(404).send("Not found")
})
mongoose.connection.once('open', ()=>{
    app.listen(PORT, ()=>{
        console.log(`The Server is running on port : ${PORT}`);
    })
})


