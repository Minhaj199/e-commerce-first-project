const multer=require('multer')


const storage = multer.diskStorage({
  destination: function (req, files, cb) {
    cb(null,'uploads'); 
  },
  filename: function (req, files, cb) {
    cb(null, Date.now() + '-' + files.originalname); 
  }
});
const upload = multer({ storage });

module.exports=upload