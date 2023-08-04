const express = require('express')
const {createNewDriver, getAllDrivers, getDriverFile} = require("../controllers/driverController");
const router = express.Router()

const multer = require('multer')

// Set up multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder where files will be saved
        cb(null, 'uploads/'); // Create a folder named 'uploads' in your project root
    },
    filename: function (req, file, cb) {
        // Set the file name with original name + timestamp to make it unique
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/drivers',upload.any(), createNewDriver)
router.get('/drivers', getAllDrivers)


router.get('/drivers/:id', getDriverFile)


// router.get('/driver/file')


module.exports = router