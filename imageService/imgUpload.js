const multer = require("multer");

const imgStore = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "profilePhoto")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname.replace(/ /g, '_'))
    }
});

const imageUpload = multer({ storage: imgStore })
module.exports = imageUpload    