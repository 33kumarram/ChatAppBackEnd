const errorHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = errorHandler(async (req, res) => {
  const { name, email, password, profile_pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the details");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already created");
  }

  const newUser = await User.create({
    name: name,
    email: email,
    password: password,
    profile_pic: profile_pic,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      profile_pic: newUser.profile_pic,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Error occurred while creating user");
  }
});

const authUser = errorHandler(async function (req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.comparePassword(password)) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Incorrect email id or password");
  }
});

const allUsers = errorHandler(async function (req, res) {
  const keyWords = req.params.username
    ? {
        $or: [
          { name: { $regex: req.params.username, $options: "i" } },
          { email: { $regex: req.params.username, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyWords).find({ _id: { $ne: req.user._id } });
  res.status(201).json(users);
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
};
