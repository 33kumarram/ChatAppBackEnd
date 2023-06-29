const express = require("express");
const upload = require("../middlewares/imgUploadMiddleware");
const { imageUpload, getImage } = require("../controllers/fileController");
const authorize = require("../middlewares/authMiddleware");
const router = express.Router();

router.route("/uploadimage").post(upload.single("file"), imageUpload);
router.route("/:filename").get(getImage);

module.exports = router;
