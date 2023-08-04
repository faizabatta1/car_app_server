require('dotenv').config()
require('./utils/mongodbConnection')

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const cookieParser = require('cookie-parser');
app.use(cookieParser())

const cors = require('cors')
app.use(cors())

app.use('/public',express.static(__dirname + '/public'));
app.set('view engine', 'ejs')


app.get('/login', (req,res) =>{
    return res.status(200).render('auth/login')
})

app.post('/api/login', async (req,res) =>{
    const { username, password } = req.body
    if(username == "admin" && password == "Admin"){
        res.cookie('isLogged','true',{
            maxAge: 36000000000000, // Cookie expiration time in milliseconds (1 hour in this case)
            httpOnly: true,
        })

        res.redirect('/')
    }else{
        return res.status(500).json({ message: "Error Message"})
    }
})
app.use((req,res,next) =>{
    if(req.cookies.isLogged == "true" && (req.url != "/login" ) ){
        next();
    }else{
        return res.redirect('/login')
    }
})

const driverRouter = require('./routes/driverRoute')
const groupRouter = require('./routes/groupRoute')
const fieldRouter = require('./routes/fieldRoute')

const userRouter = require('./routes/usersRouter')
const pdfRouter = require('./routes/pdfRoute')
app.use('/api',driverRouter,groupRouter,fieldRouter,userRouter,pdfRouter)

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