const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");

const storage = new GridFsStorage({
  url: process.env.MONGOOSE_URI,
  options: { useNewUrlParser: true },
  file: (request, file) => {
    const match = ["image/png", "image/jpg", "image/jpeg"];
    const path = `${Date.now()}_blog_${file.originalname}`;
    // check whether image is in png jpg or jpeg formate
    if (match.indexOf(file.memeType) === -1) {
      return path;
    }
    return {
      bucketName: "photos",
      filename: path,
    };
  },
});

module.exports = multer({ storage });
