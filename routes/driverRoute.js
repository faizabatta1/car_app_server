const express = require('express')
const {createNewDriver, getAllDrivers, getDriverFile} = require("../controllers/driverController");
const router = express.Router()
const PDFDocument = require('pdfkit');


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

// Sample data for the table (example)
const tableData = [
    ['Name', 'Age', 'City', 'Country'],
    ['John Doe', '30', 'New York', 'USA'],
    ['Jane Smith', '25', 'London', 'UK'],
    ['Bob Johnson', '35', 'Sydney', 'Australia'],
    // Add more data rows as needed...
];

router.get('/generate-pdf', (req, res) => {
    // Create a new PDF document
    const pdfDoc = new PDFDocument();

    // Set the response headers for a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=table_example.pdf');

    // Create a write stream to send the PDF content to the response
    pdfDoc.pipe(res);

    // Add table header
    const tableHeader = tableData[0];
    const columnWidth = 100; // Decreased column width to 100
    pdfDoc.font('Helvetica-Bold');
    for (let i = 0; i < tableHeader.length; i++) {
        pdfDoc.text(tableHeader[i], i * columnWidth + 50, 50);
    }

    // Add table rows
    const tableRows = tableData.slice(1);
    pdfDoc.font('Helvetica');
    for (let row = 0; row < tableRows.length; row++) {
        for (let col = 0; col < tableHeader.length; col++) {
            const cellValue = tableRows[row][col];
            pdfDoc.text(cellValue, col * columnWidth + 50, (row + 1) * 30 + 50);
        }
    }

    // Finalize the PDF and end the response
    pdfDoc.end();
});


// router.get('/driver/file')


module.exports = router