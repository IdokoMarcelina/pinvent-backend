const multer = require('multer')



const storage = multer.diskStorage({
    destination: function (req,file, cb){
        cb(null, 'uploads')
    },
    filename: function (req,file, cb){
        cb(null, 
           new Date().toISOString().replace(/:/g, "-") + "-"
           + file.originalname)
    }
})

function fileFilter(req,file,cb){
    if(
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ){
        cb(null, true)
    } else{
        cb(null, false)

    }
}

const upload = multer({storage: storage, fileFilter})

//file size formatter
const fileSizeFormatter = (bytes, decimal = 2) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(decimal))} ${sizes[i]}`;
};

module.exports = {
    upload,
    fileSizeFormatter
}