require("dotenv").config()
const app = require("express")()

app.get("/", (req, res)=>{
    res.send(`welcome ${process.env.ICE}`)
})

app.listen(3001, ()=> console.log("The app is running"))