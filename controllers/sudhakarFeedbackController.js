const Message = require('../models/sudhakarFeedbackModel');
const transporter = require('../utils/emailTransporter');
const resend = require('../utils/resendConfig');
// POST - Create new message
const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new Message({ name, email, message });
    // console.log(newMessage);
    await newMessage.save();

    // Send email to your email (or admin) with message info
    // await transporter.sendMail({
    //   to: process.env.SENDER_EMAIL,   // Replace with your email
    //   subject: `New Contact Message from ${name} ${email}`, // Email header
    //   html: `<p><strong>Name:</strong> ${name}</p>
    //          <p><strong>Email:</strong> ${email}</p>
    //          <p><strong>Message:</strong></p>
    //          <p>${message}</p>`, // Email body
    // });
      // Send email using the shared resend instance
    await resend.emails.send({
      from: process.env.SENDER_EMAIL,
      to: process.env.EMAIL_USER,
      subject: `New Contact Message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    res.status(201).json({ success: true, msg: "Message stored successfully!" });
  } catch (error) {
    console.error("Error storing message:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// GET - Retrieve all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

module.exports = { createMessage, getMessages };
