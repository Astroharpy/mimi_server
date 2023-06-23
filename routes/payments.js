const express = require('express')
const axios = require('axios')
const router = express.Router()
const crypto = require("crypto");
const dns = require('dns');
const Order = require('../model/Order')
const { log } = require('console');
const partUrl = "https://mimi-client.onrender.com"
const frontUrl = "https://evergreenpasture.co.za"
const mailer = require('nodemailer')


// const testingMode = true;
// const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
// const myPassphrase = "jt7NOE43FZPn";
// const merchant_id  = "22661263";
// const merchant_key = "ywvnman8qnoox";

//test
const merchant_id_t  = "10000100";
const merchant_key_t = "46f0cd694581a";


router.post('/pay', async(req, res)=>{
 try {
  const {details : data} = req.body
  const {bag} = req.body
  const {id} = req.body
  const cartTotal = req.body.cartTotal


 
  

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
myData["return_url"] = `${frontUrl}/return`;
myData["cancel_url"] = `${frontUrl}/cancel`;
myData["notify_url"] = `${partUrl}/notify`;
// Buyer details
myData["name_first"] = data.first_name
myData["name_last"] = data.last_name
myData["email_address"] = data.email
// Transaction details
myData["m_payment_id"] = id;
myData["amount"] = `${cartTotal}`;
myData["item_name"] = "Order#123";

// Generate signature
const myPassphrase = "jt7NOE43FZPn"; //process.env.PASS_PHRASE;
myData["signature"] = await generateSignature(myData, myPassphrase);

const results = await Order.create({
  "email": data.email,
  "first_name": data.first_name,
  "last_name": data.last_name,
  "province": data.province,
  "adress_line_1": data.adress_line_1,
  "adress_line_2": data.adress_line_2 || "NAN",
  "city": data.city,
  "postal_code": data.postal_code,
  "cartTotal": cartTotal,
  "order_id": id,
  "phone": data.phone,
  "signiture": myData.signature,
  "cart":bag
})


let htmlForm = `<form action="https://sandbox.payfast.co.za​/eng/process" method="post">`;
for (let key in myData) {
  if(myData.hasOwnProperty(key)){
    value = myData[key];
    if (value !== "") {
      htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
    }
  }
}


res.send(htmlForm += '<input type="submit" value="Pay Now"/></form>')
 } catch (error) {
  log(error)
 }
   }
)

router.post('/notify', async(req, res)=>{
  try {
    const passPhrase = "jt7NOE43FZPn"; //process.env.PASS_PHRASE
  const {m_payment_id, name_first, email_address} = await req.body
  const getTotal = await Order.findOne({order_id : m_payment_id})
  const cartTotal = getTotal.cartTotal

  const testingMode = true;
  const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
  
  const pfData = JSON.parse(JSON.stringify(req.body));
  
  let pfParamString = "";
  for (let key in pfData) {
    if(pfData.hasOwnProperty(key) && key !== "signature"){
      pfParamString +=`${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
    }
  }
  
  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  //<---  ***** --->//

  const pfValidSignature = (pfData, pfParamString, pfPassphrase = null ) => {
    // Calculate security signature
    let tempParamString = '';
    if (pfPassphrase !== null) {
      pfParamString +=`&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
    }
  
    const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
    return pfData['signature'] === signature;
  }; 

   //<---  ***** --->//

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

     //<---  ***** --->//

     const pfValidPaymentData = ( cartTotal, pfData ) => {
      return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
  };

      //<---  ***** --->//

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

       //<---  ***** --->/?

      const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
      const check2 = pfValidIP(req);
      const check3 = pfValidPaymentData( cartTotal, pfData );
      const check4 = pfValidServerConfirmation(pfHost, pfParamString);

      if(check1 && check2 && check3 && check4) {
          // All checks have passed, the payment is successful
        
          //smtp details
          const msg = `
            <h1>Your order has been recieved<h1>
            <p>order number #${m_payment_id} </p>
            <p> items </p>
            <p>Total : R ${cartTotal}</p>
          `
          const user = process.env.EMAIL_USER
          const password = process.env.EMAIL_PASSWORD
          let transporter = mailer.createTransport({
              host: "smtpout.secureserver.net", // hostname
              secureConnection: false, // TLS requires secureConnection to be false
              secure: true,
              port: 587, // port for secure SMTP
              auth: {
                  user: user,
                  pass: password
              },
              tls: {
                  ciphers:'SSLv3'
              },
              requireTLS:true,
              port: 465,
              debug: true
          })

          //sending email confirmation
          let info = await transporter.sendMail({
            from: user,
            to: email_address,
            subject: "Order Confirmation",
            html: msg,
          });
          //updating the payment status
          const res = await Order.updateOne({order_id : m_payment_id}, { paid: true })
          //payment status
          log("payments success")
      } else {
          // Some checks have failed, check payment manually and log for investigation
          log([check1, check2, check3,check4])
      }
    
  } catch (error) {
    log(error)
  }
})

router.get('/return', async(req, res)=>{
 
  res.send("<h1>Payment successful</h1>")
})
router.get('/cancel', async(req, res)=>{
  res.send("<h1>Payment Cancelled</h1>")
})



module.exports = router