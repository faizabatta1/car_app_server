const express = require('express')
const {getAllCars, createNewCar, updateCar, deleteCar} = require("../controllers/car_controller");
const router = express.Router()

router.get('/cars', getAllCars)
router.post('/cars', createNewCar)
router.put('/cars/:id', updateCar)
router.delete('/cars/:id', deleteCar)

module.exports = router