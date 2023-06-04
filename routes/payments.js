const express = require('express')
const axios = require('axios')
const router = express.Router()
const crypto = require("crypto");
const dns = require('dns');
const fs = require('fs/promises');
const { log } = require('console');


const testingMode = true;
const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
const myPassphrase = "jt7NOE43FZPn";


router.post('/pay', async(req, res)=>{
  console.log(req.body)

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
myData["merchant_id"] = "10000100";
myData["merchant_key"] = "46f0cd694581a";
myData["return_url"] = "https://783e-105-1-50-29.ngrok-free.app/return_url";
myData["cancel_url"] = "https://783e-105-1-50-29.ngrok-free.app/cancel_url";
myData["notify_url"] = "https://783e-105-1-50-29.ngrok-free.app/notify_url";
// Buyer details
myData["name_first"] = "First Name";
myData["name_last"] = "Last Name";
myData["email_address"] = "test@test.com";
// Transaction details
myData["m_payment_id"] = "1234";
myData["amount"] = "10.00";
myData["item_name"] = "Order#123";

// Generate signature

myData["signature"] = generateSignature(myData, myPassphrase);

let htmlForm = `<form action="https://${pfHost}/eng/process" method="post">`;

for (let key in myData) {
  if(myData.hasOwnProperty(key)){
    value = myData[key];
    if (value !== "") {

      htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
      
    }
  }
}


res.send(htmlForm += '<input type="submit" value="Pay Now" /></form>')
  
})

router.get('/return_url', (req, res)=>{
  res.send("h")
})
router.get('/notify_url', (req, res)=>{

  const pfData = JSON.parse(JSON.stringify(req.body));
  console.log(JSON.parse(JSON.stringify(req.body)))

let pfParamString = "";
for (let key in pfData) {
  if(pfData.hasOwnProperty(key) && key !== "signature"){
    pfParamString +=`${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
  }
}

// Remove last ampersand
pfParamString = pfParamString.slice(0, -1);

const pfValidSignature = (pfData, pfParamString, pfPassphrase = null ) => {
  // Calculate security signature
  let tempParamString = '';
  if (pfPassphrase !== null) {
    pfParamString +=`&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
  }

  const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
  return pfData['signature'] === signature;
}; 

async function ipLookup(domain){
  return new Promise((resolve, reject) => {
    dns.lookup(domain, {all: true}, (err, address, family) => {
      if(err) {
        reject(err)
      } else {
        const addressIps = address.map(function (item) {
         return item.address;
        });
        resolve(addressIps);
      }
    });
  });
}

const pfValidIP = async (req) => {
  const validHosts = [
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za'
  ];

  let validIps = [];
  const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try{
    for(let key in validHosts) {
      const ips = await ipLookup(validHosts[key]);
      validIps = [...validIps, ...ips];
    }
  } catch(err) {
    console.error(err);
  }

  const uniqueIps = [...new Set(validIps)];

  if (uniqueIps.includes(pfIp)) {
    return true;
  }
  return false;
};

const pfValidPaymentData = ( cartTotal, pfData ) => {
  return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
};

const pfValidServerConfirmation = async (pfHost, pfParamString) => {
  const result = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString)
      .then((res) => {
          return res.data;
      })
      .catch((error) => {
          console.error(error)
      });
 return result === 'VALID';
};

const check1 = pfValidSignature(pfData, pfParamString, myPassphrase);
const check2 = pfValidIP(req);
const check3 = pfValidPaymentData( 10, pfData );
const check4 = pfValidServerConfirmation(pfHost, pfParamString);

if(check1 && check2 && check3 && check4) {
    // All checks have passed, the payment is successful
    fs.writeFile('newfile.txt', 'Learn Node FS module', function (err) {
      if (err) throw err;
      console.log('File is created successfully.');
    });
} else {
    // Some checks have failed, check payment manually and log for investigation
    fs.writeFile('failfile.txt', 'Learn Node FS module', function (err) {
      if (err) throw err;
      console.log('File is created successfully.');
    });
}
 

})
router.get('/cancel_url', (req, res)=>{
  res.send(`<h1>hi</h1>
  `)
})


module.exports = router