const adressDB ={
    adresses: require('../model/addresses.json'),
    setAdress: function (data) { return this.adresses = data}

}
const fsPromises = require('fs/promises')
const path = require('path')

const adressController = async (req, res) =>{
   

    try { 
        const{fname: first_name, lname: last_name, line1: adress_line_1, line2, adress_line_2,
        province, city, zip: zip_code, default: make_default} = req.body.data
       
        const data ={
            user: req.user,
            default:{
            first_name,
            last_name,
            adress_line_1,
            adress_line_2: adress_line_2 || "NA",
            province, city,
            zip_code}
        }

        const duplicate = adressDB.adresses.find(adress => adress.user === req.user)
        if( duplicate ) {
            const filtered = adressDB.adresses.filter(adress => adress.user !== data.user)
            duplicate.current = data.default
            adressDB.setAdress([ ...filtered, duplicate ])
        } else{
            adressDB.setAdress([...adressDB.adresses, data])
        }
        const modelsFolder = path.join(__dirname, '..', 'model', 'addresses.json')
        
        fsPromises.writeFile(modelsFolder, JSON.stringify(adressDB.adresses))

        
        res.status(200).json({success:"success"})
    } catch (error) {
        console.log(error);
    }
}





module.exports = adressController