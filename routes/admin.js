const express = require('express')
const ImageKit = require("imagekit");
const router = express.Router()
const Product = require('../model/Product')
const Order = require('../model/Order')
const authController = require("../controllers/authController")
const logoutController = require("../controllers/logoutController")
const verifyJwT = require("../middleware/verifyJWT")
const {log} = require("console")

const imagekit = new ImageKit({
  publicKey : process.env.PUBLIC_KEY,
  privateKey : process.env.PRIVATE_KEY,
  urlEndpoint : process.env.ENDPOINT
});


router.get('/admin/new-product', verifyJwT,async (req, res) =>{
  var authenticationParameters = imagekit.getAuthenticationParameters();
  log(authenticationParameters);
  res.json(authenticationParameters);
})

router.post('/admin/new-product', verifyJwT , async (req, res)=>{
  try {
    const {name, price, quantity, description, url} = req.body

    const results = await Product.create({
      "name": name,
      "price": +price,
      "quantity": +quantity,
      "description":description,
      "imageUrl": url
  })

    console.log(results);
    res.json({success: "success"})
  } catch (err) {
    console.error(err)
    res.json({error : "error"})
  }
})

// getting all the orders that have been paid for 
router.post('/login', authController)
router.post("/logout", logoutController)

router.get('/admin/orders', verifyJwT ,async (req, res)=>{
  try {
    const results = await Order.find({paid: true})
    
    res.json(results)
  } catch (error) {
    log(error)
    res.send("failed")
  }
  
})

module.exports = router