const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    province:{
        type: String,
        required: false,
        default: "gauteng"
    },
    adress_line_1:{
        type: String,
        required: true
    },
    adress_line_2:{
        type: String,
        required: false
    },
    city:{
        type: String,
        required: true
    },
    postal_code:{
        type: Number,
        required: true
    },
    cartTotal:{
        type: Number,
        required: true
    },
    order_id:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    signiture:{
        type: String,
        required: true
    },
    cart:{
        type: Object,
        required: true
    }, 
    status:{
        type: String,
        required: false,
        default: "preparing"
    },
    paid: {
        type: Boolean,
        required: false,
        default: false
    }
})

module.exports = mongoose.model('Order', orderSchema)