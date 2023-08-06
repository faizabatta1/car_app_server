const express = require('express')
const router = express.Router()
const Car = require('../models/Car')

router.get('/cars', async (req,res) =>{
  try{
    let cars = await Car.find({})
    return res.status(200).render('car/index',{
      cars:cars
    })
  }catch (error){
    return res.send(`<h1>Internal Server Error 500</h1><br /> <h2>${error.message}</h2>`)
  }
})
// router.get('/cars/:id')
router.get('/cars/create', async (req,res) =>{
  return res.status(200).render('car/create')
})
// router.get('/cars/update')

module.exports = router
