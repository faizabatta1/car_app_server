require('dotenv').config()
require('./utils/mongodbConnection')

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const cors = require('cors')
app.use(cors())

app.use('/public',express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

const driverRouter = require('./routes/driverRoute')
const groupRouter = require('./routes/groupRoute')
const fieldRouter = require('./routes/fieldRoute')

const userRouter = require('./routes/usersRouter')
app.use('/api',driverRouter,groupRouter,fieldRouter,userRouter)

const driverFront = require('./routes/driverFront')
const groupFront = require('./routes/groupFront')
const fieldFront = require('./routes/fieldFront')
const pdfFront = require('./routes/pdfFront')
const usersFront = require('./routes/usersFront')

app.use(driverFront,groupFront,fieldFront,pdfFront,usersFront)


app.get('/',(req,res) =>{
    return res.status(200).render('index')
})

const port = process.env.port || 3000
app.listen(port, () => console.log(`Server is running on port ${port}`))