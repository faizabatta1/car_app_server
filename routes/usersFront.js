const express = require('express')
const router = express.Router()
const User = require('../models/usersModel')


router.get('/users',async  (req,res) =>{
    try{
        let users = await User.find({})
        return res.status(200).render('users/read',{
            users: users
        })
    }catch (error){

    }
})

module.exports = router