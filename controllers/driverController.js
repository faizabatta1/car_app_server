const PDFDocument = require('pdfkit');
const fs = require('fs')
const Group = require('../models/Group')
const uuid = require("uuid");
const bucket = require("../utils/firebase");
const PDF = require('../models/PDF')
const jwt = require('jsonwebtoken')

const createNewDriver = async (req,res) =>{
    console.log(req.body)
    try{
        let values = Object.values(req.body).map(e => JSON.parse(e))

        const groupedData = values.reduce((acc, obj) => {
            if (!acc[obj.form]) {
                acc[obj.form] = {};
            }

            if (!acc[obj.form][obj.group]) {
                acc[obj.form][obj.group] = [];
            }

            acc[obj.form][obj.group].push(obj);
            return acc;
        }, {});

        console.log(groupedData);


        // Create a new PDF document
        const doc = new PDFDocument();
        doc.font('Helvetica-Bold').fontSize(24).text('Daily car schedule', { align: 'center' });

        for(let rf1 of Object.keys(groupedData['First'])){
            let ggr = await Group.findOne({ _id:rf1 })
                if (ggr.name == 'No Group'){
                    for(rfg1 of groupedData['First'][rf1]){
                        doc.fontSize(16).text(`${rfg1.title}   `, { continued: true,  });
                        doc.fontSize(14).text(`${rfg1.value}`, { underline: true });
                        doc.moveDown();
                    }
                }
        }

        for(let rf2 of Object.keys(groupedData['First'])){
            let ggr = await Group.findOne({ _id:rf2 })

            if(ggr.name != "No Group"){
                doc.fontSize(20).text(ggr.name + ':')
                for(rfg2 of groupedData['First'][rf2]){
                    doc.fontSize(16).text("              " + rfg2.title + "   ",{ continued:true })
                    doc.fontSize(16).text(rfg2.value, { underline: true })
                    doc.moveDown()
                }
            }
        }

        doc.addPage()

        // for(let rf1 of groupedData['Second']['null']){
        //     doc.fontSize(16).text(`${rf1.title}   `, { continued: true });
        //     doc.fontSize(14).text(`${rf1.value}`, { underline: true });
        //     doc.moveDown();
        // }
        //
        // for(let rf2 of Object.keys(groupedData['Second'])){
        //     if(rf2 != "null"){
        //         doc.fontSize(20).text(rf2 + ':')
        //         for(rfg2 of groupedData['Second'][rf2]){
        //             doc.fontSize(16).text(rfg2.title + "   ",{ continued:true })
        //             doc.fontSize(16).text(rfg2.value, { underline: true })
        //             doc.moveDown()
        //         }
        //     }
        // }

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
            let decoded = jwt.verify(token,'your-secret-key');

            let pdf = new PDF({
                name: fileName,
                link:url,
                userId:decoded.userId
            })

            await pdf.save()

        },2000)

        console.log(`PDF saved: ${filePath}`);

        res.status(200).json({ message: 'PDF generated and saved successfully' });
    }catch (error){
        console.log(error.message)
    }
    // try {
    //
    //     // Add content to the PDF document
    //
    //     for (const entry in data) {
    //         let decoded = JSON.parse(data[entry])
    //         if(decoded.answerDataType === 'text' || decoded.answerDataType === 'number'){
    //
    //         }
    //     }
    //
    //     let values = data.values()
    //     console.log(values)
    //
    //
    //     for(const entry in data){
    //         let decoded = JSON.parse(data[entry])
    //         if(decoded.group != undefined || decoded.group != null){
    //             console.log(decoded)
    //             const groups = decoded.reduce((acc, obj) => {
    //                 const groupKey = obj.group;
    //                 if (!acc[groupKey]) {
    //                     acc[groupKey] = [];
    //                 }
    //                 acc[groupKey].push(obj);
    //                 return acc;
    //             }, {});
    //
    //             for(g in groups){
    //                 doc.fontSize(18).text(g)
    //                 for(d of g){
    //                     doc.fontSize(16).text(`${d.title}  `)
    //                     doc.fontSize(16).text(d.value)
    //                 }
    //             }
    //         }
    //     }
    //

    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Error generating PDF');
    // }
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