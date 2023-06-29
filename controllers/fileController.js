const asyncHandler = require("express-async-handler");
const gridFs = require("gridfs-stream");
const mongoose = require("mongoose");
const appUrl = process.env.APP_URL;

const conn = mongoose.connection;

let gfs, gridFsBucket;
conn.once("open", () => {
  gridFsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "fs",
  });
  gfs = gridFs(conn.db, mongoose.mongo);
  gfs.collection("fs");
});

const imageUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("File not found");
  }
  const imageUrl = `${appUrl}/files/${req.file.filename}`;
  res.status(201).json({
    imageUrl: imageUrl,
  });
});

const getImage = asyncHandler(async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gridFsBucket.openDownloadStream(file._id);
    readStream.pipe(res);
  } catch (err) {
    res.status(400);
    throw new Error("Error occurred while fetching image");
  }
});

module.exports = {
  imageUpload,
  getImage,
};
