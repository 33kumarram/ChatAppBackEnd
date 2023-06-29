const express = require("express");
const authorize = require("../middlewares/authMiddleware");
const {
  sendMessage,
  fetchAllMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.route("/send").post(authorize, sendMessage);
router.route("/:chatId").get(authorize, fetchAllMessages);

module.exports = router;
