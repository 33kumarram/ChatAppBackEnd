const express = require("express");
const authorize = require("../middlewares/authMiddleware");
const {
  authUser,
  registerUser,
  allUsers,
} = require("../controllers/userController");

const router = express.Router();

router.post("/login", authUser);
router.route("/signup").post(registerUser);
router.route("/search/:username").get(authorize, allUsers);

module.exports = router;
