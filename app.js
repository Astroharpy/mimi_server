const app = require("express")()

const PORT = 3000

app.get('/', (req, res)=>{
    res.send(`<h1>Welcome ice </h1>`)
})

app.listen(PORT, ()=> console.log(`The app is running on port : ${PORT}`))
