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
        console.log(req.file)
        console.log(req.files)
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

        doc.text(`Location: ${information.locations.join(',')}`,50,100)
        doc.text(`Car: ${information.boardNumber + "  " + information.privateNumber}`,50,120)
        doc.text(`Shift: ${information.day + " - " + information.period}`,50,140)
        doc.text(`Number Of Violations: ${information.trafficViolations}`,50,160)

        doc.text(`Date: ${information.date}`,50,180)
        let decodedToken = jwt.verify(token,'your-secret-key')
        let user = await User.findOne({ _id: decodedToken.userId })
        doc.text(`User: ${user.name} - ${user.accountId}`,50,200)

        // Add table header
        const tableHeader = ['Title', 'Status', 'Notes'];
        const firstColumnWidth = 300; // Width for the first column
        const otherColumnsWidth = 140; // Width for other columns

        doc.font('Helvetica-Bold');
        for (let i = 0; i < tableHeader.length; i++) {
            switch (i){
                case 0:
                    doc.text(tableHeader[i],50,240)
                    break;
                case 1:
                    doc.text(tableHeader[i],340,240)
                    break;
                case 2:
                    doc.text(tableHeader[i],380,240)
                    break;
                default:
                    break;

            }
            // const columnWidth = i === 0 ? firstColumnWidth : otherColumnsWidth;
            // doc.text(tableHeader[i], i * columnWidth + 50, 220);
        }

        doc.font('Helvetica');
        let row = 0;

        for (let sub of [...groupedData['First'],...groupedData['Second']]) {
            for (let col = 0; col < tableHeader.length; col++) {
                let newTitle = sub.title.length > 50 ?
                    sub.title.substring(0, sub.title.length / 2) + '\n' + sub.title.substring(sub.title.length / 2) : sub.title
                if(sub.answerDataType == 'yes_no'){
                    switch (col){
                        case 0:
                            doc.text([newTitle, sub.value, 'XXX'][col],50,(row + 1) * 30 + 240)
                            break;
                        case 1:
                            doc.text([newTitle,sub.value != 'Nei' ? 'Ja' : 'Nei', 'XXX'][col],340,(row + 1) * 30 + 240)
                            break;
                        case 2:
                            doc.text([newTitle,sub.value, sub.value != "Nei" ? (sub.hasRequiredDescription ? sub.value : 'XXX') : 'XXX'][col],380,(row + 1) * 30 + 240)
                            break;
                        default:
                            break;

                    }
                }

            }

            row++;
        }

        doc.addPage()

        for(let file of req.files){
            doc.fontSize(20).text(file.fieldname,20,20)
            doc.image(file.path,20,50,{
                height: 250,
                width: 250
            })
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