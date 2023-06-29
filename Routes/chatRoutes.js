const express = require("express");
const authorize = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
const router = express.Router();

router.route("/accesschat").post(authorize, accessChat);
router.route("/").get(authorize, fetchChats);
router.route("/group").post(authorize, createGroupChat);
router.route("/rename").put(authorize, renameGroup);
router.route("/addtogroup").put(authorize, addToGroup);
router.route("/removefromgroup").put(authorize, removeFromGroup);

module.exports = router;
