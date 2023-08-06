const PDFDocument = require('pdfkit');
const fs = require('fs')
const Group = require('../models/Group')
const uuid = require("uuid");
const bucket = require("../utils/firebase");
const PDF = require('../models/PDF')
const jwt = require('jsonwebtoken')
const User = require('../models/usersModel')

const createNewDriver = async (req,res) =>{
    try {
        const { data, token } = req.headers
        const information = JSON.parse(data)

        let values = Object.values(req.body).map(e => JSON.parse(e))

        const groupedData = values.reduce((acc, obj) => {
            if (!acc[obj.form]) {
                acc[obj.form] = [];
            }

            acc[obj.form].push(obj);
            return acc;
        }, {});


        // Create a new PDF document
        const doc = new PDFDocument();
        doc.font('Helvetica-Bold').fontSize(12).text('Daily car schedule', { align: 'center' });

        doc.text(`Location: ${information.location}`,50,100)
        doc.text(`Car: ${information.boardNumber + "  " + information.privateNumber}`,50,120)
        doc.text(`Shift: ${information.day + information.period}`,50,140)

        doc.text(`Date: ${new Date().toLocaleString()}`,50,160)
        let decodedToken = jwt.verify(token,'your-secret-key')
        let user = await User.findOne({ _id: decodedToken.userId })
        doc.text(`User: ${user.name}-${user.accountId}-${user.phone}`,50,180)

        // Add table header
        const tableHeader = ['Checked', 'Text', 'None', 'Question'];
        const firstColumnWidth = 300; // Width for the first column
        const otherColumnsWidth = 60; // Width for other columns

        doc.font('Helvetica-Bold');
        for (let i = 0; i < tableHeader.length; i++) {
            const columnWidth = i === 0 ? firstColumnWidth : otherColumnsWidth;
            doc.text(tableHeader[i], i * columnWidth + 50, 220);
        }

        doc.font('Helvetica');
        let row = 0;
        for (let sub of groupedData['First']) {
            for (let col = 0; col < tableHeader.length; col++) {
                const cellValue = [sub.value, 'Text', 'None',sub.title][col];
                const columnWidth = col === 0 ? firstColumnWidth : otherColumnsWidth;
                doc.text(cellValue, col * columnWidth + 50, (row + 1) * 30 + 220);
            }

            row++;
        }

        doc.addPage()

        // Add table header
        const tableHeaderX = ['Day', 'Night', 'Weekend', 'Mistakes'];
        const firstColumnWidthX = 300; // Width for the first column
        const otherColumnsWidthX = 60; // Width for other columns

        doc.font('Helvetica-Bold');
        for (let i = 0; i < tableHeaderX.length; i++) {
            const columnWidth = i === 0 ? firstColumnWidthX : otherColumnsWidthX;
            doc.text(tableHeaderX[i], i * columnWidth + 50, 100);
        }

        doc.font('Helvetica');
        let rowX = 0;
        for (let sub of groupedData['Second']) {
            for (let col = 0; col < tableHeaderX.length; col++) {
                const cellValue = [sub.value, 'Text', 'None',sub.title][col];
                const columnWidth = col === 0 ? firstColumnWidthX : otherColumnsWidthX;
                doc.text(cellValue, col * columnWidth + 50, (rowX + 1) * 30 + 100);
            }

            rowX++;
        }

        // Generate a unique filename for the PDF
        const fileName = `driver_profile_${Date.now()}.pdf`;

        // Save the PDF to a file on the server
        const filePath = `./pdfs/${fileName}`;
        doc.pipe(fs.createWriteStream(filePath));
        doc.end();

        setTimeout(async () => {
            const tokenU = uuid.v4();

            const metadata = {
                metadata: {
                    // This line is very important. It's to create a download token.
                    firebaseStorageDownloadTokens: tokenU,
                },
                contentType: 'application/pdf',
                cacheControl: `public, max-age=${Date.now() + 10 * 60 * 60 * 24 * 30 * 365}`,
            };

            await bucket.upload(filePath, {
                // Support for HTTP requests made with `Accept-Encoding: gzip`
                gzip: true,
                metadata: metadata,
            });

            const url = `https://firebasestorage.googleapis.com/v0/b/zainfinal-b9de0.appspot.com/o/${fileName}?alt=media&token=${tokenU}`
            console.log(url)

            const token = req.headers.token
            let decoded = jwt.verify(token, 'your-secret-key');

            let pdf = new PDF({
                name: fileName,
                link: url,
                userId: decoded.userId
            })

            await pdf.save()

        }, 2000)

        console.log(`PDF saved: ${filePath}`);

        res.status(200).json({ message: 'PDF generated and saved successfully' });
    } catch (error) {
        console.log(error.message)
    }

}

const getAllDrivers = async (req,res) =>{
    return res.status(200).json([])
}

const getDriverFile = async () =>{
    try{

    }catch (error){

    }
}

module.exports = { createNewDriver, getAllDrivers, getDriverFile }