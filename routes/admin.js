const express = require('express')
const ImageKit = require("imagekit");
const router = express.Router()
const Product = require('../model/Product')

const imagekit = new ImageKit({
  publicKey : process.env.PUBLIC_KEY,
  privateKey : process.env.PRIVATE_KEY,
  urlEndpoint : process.env.ENDPOINT
});


router.get('/admin/new-product', async (req, res) =>{
  var authenticationParameters = imagekit.getAuthenticationParameters();
  console.log(authenticationParameters);
  res.json(authenticationParameters);
})

router.post('/admin/new-product', async (req, res)=>{
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

module.exports = router