const errorHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

const sendMessage = errorHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Incomplete data");
  }

  try {
    const newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name profile_pic");
    message = await message.populate("chat");
    message = await message.populate("chat.users", "name profile_pic email");

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(201).json(message);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error("Some error occurred while sending the message");
  }
});

const fetchAllMessages = errorHandler(async (req, res) => {
  const chatId = req.params.chatId;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name profile_pic email")
      .populate("chat");
    res.status(201).json(messages);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error("Error occurred while fetching messages");
  }
});

module.exports = {
  sendMessage,
  fetchAllMessages,
};
