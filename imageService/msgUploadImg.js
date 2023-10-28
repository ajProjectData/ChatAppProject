const multer = require("multer");

const msgImgStore = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "msgPhotoSend")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname.replace(/ /g, '_'))
    }
});

const msgUploadImg = multer({ storage: msgImgStore })
module.exports = msgUploadImg
