const addressDB ={
    adress: require('../model/addresses.json')
}

const verifyAdress = async (req, res, next) =>{
    const user = req.user

    const findAdress = addressDB.adress.find(adress => adress.user === user)
    if(!findAdress){
        req.isAdress = "false"
    }else{
        req.isAdress = "true"
    }
    next()
}

module.exports = verifyAdress