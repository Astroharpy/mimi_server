const ordersDB ={
    //orderNo. PK
    //user FK 
    //adress FK
    //cart (from front-end)
    //payment status (payfast or ozow API)
    //fulfiled (hadled by the admin after delivery)
    orders: require('../model/orders.json'),
    setOrder: function (data) { return this.orders = data}
}

const adressDB = {
    adress : require('../model/addresses.json')
}

//existing customer, defualt adress
//existing customer, current adress
//new customer, default

const orderController = async (req, res) =>{
    
}

module.exports = orderController