const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../model/file');
const { v4 : uuid4} = require('uuid');


let storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, 'uploads/'),
    filename: (req,  file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});



let upload = multer({
    storage,
    limit: {fileSize: 1000000  * 100}
}).single('myfile');




router.post('/', (req,res) => {

  



  upload(req, res,   async (err) =>{

    if(!req.file){

        return res.json({error : "all fields are required "})
  
    }

    if(err){
        return res.status(500).send({ error : err.message })
    }

    const file = new File({
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path,
        size: req.file.size
    })

    const response = await file.save();
    return res.json({ file: `${process.env.APP_BASEURL}/files/${response.uuid}`})
    

  })
})



router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom, expiresIn } = req.body;
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.'});
    }

    const file = await File.findOne({uuid: uuid});
    if(file.sender) {
        return res.status(422).send({ error: 'Email already sent once.'});
      }

    file.sender = emailFrom;
    file.receiver = emailTo;


    const response = await file.save();
    const sendMail = require('../services/emailService');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'inShare file sharing',
        text: `${emailFrom} shared a file with you.`,
        html: require('../services/emailTemplet')({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASEURL}/files/${file.uuid}?source=email` ,
            size: parseInt(file.size/1000) + ' KB',
            expires: '24 hours'
        })
    });

    return res.send({success: true})



});

module.exports = router;