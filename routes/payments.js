const express = require('express')
const axios = require('axios')
const router = express.Router()
const crypto = require("crypto");
const dns = require('dns');
const fs = require('fs/promises');
const { log } = require('console');
const partUrl = "https://mimi-client.onrender.com"


const merchant_id_t  = "10000100";
const merchant_key_t = "46f0cd694581a";


router.get('/pay', async(req, res)=>{

  const generateSignature = (data, passPhrase = null) => {
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
      if(data.hasOwnProperty(key)){
        if (data[key] !== "") {
          pfOutput +=`${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
        }
      }
    }
  
    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
      getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }
  
    return crypto.createHash("md5").update(getString).digest("hex");
  }; 


  const myData = [];
// Merchant details
myData["merchant_id"] = merchant_id_t; //process.env.MERCHANT_ID;
myData["merchant_key"] = merchant_key_t; // process.env.MERCHANT_KEY;
myData["return_url"] = `${partUrl}/return`;
myData["cancel_url"] = `${partUrl}/cancel`;
myData["notify_url"] = `${partUrl}/notify`;
// Buyer details
myData["name_first"] = "First Name";
myData["name_last"] = "Last Name";
myData["email_address"] = "test@test.com";
// Transaction details
myData["m_payment_id"] = "1234";
myData["amount"] = "5.00";
myData["item_name"] = "Order#123";

// Generate signature
const myPassphrase = "jt7NOE43FZPn"; //process.env.PASS_PHRASE;
myData["signature"] = generateSignature(myData, myPassphrase);

let htmlForm = `<form action="https://sandbox.payfast.co.za​/eng/process" method="post">`;
for (let key in myData) {
  if(myData.hasOwnProperty(key)){
    value = myData[key];
    if (value !== "") {
      htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
    }
  }
}

res.send(htmlForm += '<input type="submit" value="Pay Now" /></form>')

  }
)

router.get('/return', (req, res)=>{
  res.send("<h1>Welcome back</h1>")
})

router.post('/notify', async(req, res)=>{
  log(req.body)
  res.sendStatus(200)

})
 


router.get('/cancel', (req, res)=>{
  res.send(`<h1>hi</h1>
  `)
})


module.exports = router
