const express = require('express')
const {getAllLocations, createLocation, updateLocation, deleteLocation} = require("../controllers/location_controller");
const router = express.Router()

router.get('/locations', getAllLocations)
router.post('/locations', createLocation)
router.put('/locations/:id', updateLocation)
router.delete('/locations/:id', deleteLocation)

module.exports = router