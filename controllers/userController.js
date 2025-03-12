const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/emailTransporter');
const crypto = require('crypto');
const moment = require('moment');


require('dotenv').config();

   
function generateSixDigitToken() {
  return (crypto.randomInt(100000, 1000000)).toString();
}

// Register User & Send OTP
exports.register = async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
  

    
    function generateSixDigitToken() {
      return (crypto.randomInt(100000, 1000000)).toString();
    }
    
    const otp = generateSixDigitToken();
    console.log(otp);
        
     const otpExpires = moment().add(5, 'minutes').toDate(); // Expires in 10 minutes
    

    let user = new User({ name, email, password: hashedPassword, phone, otp, otpExpires });
    await user.save();

    console.log(`OTP generated for ${email}: ${otp}`);
    


    await transporter.sendMail({
        to: email,
        subject: "Your OTP for Verification",
        html: `<p>Your OTP for verification is: <strong>${otp}</strong></p>
               <p>This OTP is valid for 5 minutes.</p>`,
      });

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    console.log('Received OTP verification request:', req.body);
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.otp !== otp || new Date() > user.otpExpires) {
      console.log(`Invalid OTP attempt for ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    console.log(`OTP verified for ${email}`);
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error in verifyOtp:', err);
    res.status(500).json({ message: err.message });
  }
};



exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Resend OTP request received for email: ${email}`); // ✅ Debugging

    // ✅ Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // ✅ Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpires = moment().add(5, 'minutes').toDate();
    await user.save();

    // ✅ Send email
    await transporter.sendMail({
      to: email,
      subject: "Resend OTP for Verification",
      html: `<p>Your new OTP is: <strong>${otp}</strong></p>
             <p>This OTP is valid for 5 minutes.</p>`,
    });

    console.log(`OTP Resent to ${email}: ${otp}`); // ✅ Debugging
    res.status(200).json({ message: 'New OTP sent to email' });

  } catch (err) {
    console.error('Error in resendOtp:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



// Login User
exports.login = async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // 🔹 Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // 🔹 If user is not verified, send OTP and redirect to verification page
    if (!user.isVerified) {
      console.log("User not verified, sending OTP...");
      
      const otp = generateSixDigitToken();
      user.otp = otp;
      user.otpExpires = moment().add(5, 'minutes').toDate();
      await user.save();
      console.log(`New OTP: ${otp} sent to ${email}`);

      await transporter.sendMail({
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>
               <p>This OTP is valid for 5 minutes.</p>`,
      });

      return res.status(403).json({ 
        message: 'Account not verified. OTP sent.', 
        redirectTo: 'VerifyOTP' 
      });
    }


    console.log(`User logged in: ${email}`);

    res.status(200).json({ message: 'Login successful' });

  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




// Verify OTP and reset password
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    console.log("Request Data:", { email, otp, newPassword, confirmPassword });
    console.log("Stored OTPs:", otpStorage); // Debugging

    try {
        const storedOTP = otpStorage[email.toLowerCase()];

        console.log("Retrieved OTP Data:", storedOTP); // Debugging

        if (!storedOTP) {
            return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
        }

        if (storedOTP.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > storedOTP.expiresAt) {
            delete otpStorage[email.toLowerCase()];
            return res.status(400).json({ message: 'OTP expired. Request a new one.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        delete otpStorage[email.toLowerCase()]; // Remove OTP after use

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ Fix: Use correct param name
    console.log('User ID to delete:', userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error in deleteUserById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.getUserCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ count: userCount });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ error: "Error fetching user count" });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Excluding passwords for security
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
};
