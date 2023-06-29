const { json } = require("express");
const errorHandler = require("express-async-handler");
const chat = require("../models/chatModel");
const user = require("../models/userModel");

const accessChat = errorHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("User Id not found in body");
    return res.sendStatus(400);
  }
  let isChat = await chat
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await user.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.status(201).json(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
  }

  try {
    const newChat = await chat.create(chatData);

    const fullChat = await chat
      .findOne({ _id: newChat._id })
      .populate("users", "-password");
    res.status(201).json(fullChat);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

const fetchChats = errorHandler(async (req, res) => {
  try {
    let chats = await chat
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chats = await user.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.status(201).json(chats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = errorHandler(async (req, res) => {
  const { users, chatName } = req.body;
  if (!users || !chatName) {
    res.status(400);
    throw new Error("Please fill all the details");
  }

  if (users.length < 2) {
    res.status(400);
    throw new Error("For group chat minimum 3 persons required");
  }

  users.push(req.user);

  try {
    let chatData = {
      chatName: chatName,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    };

    let groupChat = await chat.create(chatData);

    let fullGroupChat = await chat
      .findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = errorHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await chat
      .findByIdAndUpdate(
        chatId,
        {
          chatName: chatName,
        },
        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(201).send(updatedChat);
  } catch (error) {
    res.status(404);
    throw new Error("Chat not found");
  }
});
const addToGroup = errorHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await chat
      .findByIdAndUpdate(
        chatId,
        {
          $push: { users: userId },
        },
        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(201).json(added);
  } catch (error) {
    res.status(404);
    throw new Error("Chat not found");
  }
});

const removeFromGroup = errorHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await chat
      .findByIdAndUpdate(
        chatId,
        {
          $pull: { users: userId },
        },
        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(201).json(removed);
  } catch (error) {
    res.status(404);
    throw new Error("Chat not found");
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
