const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        unique: true
    }
})

const LocationModel = mongoose.model('Location', LocationSchema)

module.exports = LocationModel