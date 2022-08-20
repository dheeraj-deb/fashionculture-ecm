const multer = require('multer');
const path = require('path');
const app = require('../app');
const uuid = require('uuid').v4

const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
        cb(null, path.join(__dirname, '../', 'public/images'))
    },
    filename:(req, file, cb) => {
        const {originalname} = file;
        cb(null, `${uuid()}${originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype.split('/')[0] === 'image'){
        return cb(null, true)
    }
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
}

// files:3
const upload = multer({storage, fileFilter, limits:{fileSize:100000000}}) 


module.exports = upload;

