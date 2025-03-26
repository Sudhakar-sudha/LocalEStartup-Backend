const DeliveryBoy = require("../models/deliveryBoyModel");
const transporter = require('../utils/emailTransporter');
const crypto = require("crypto");


function generateOtp() {
  return (crypto.randomInt(100000, 1000000)).toString();
}
// Register a new Delivery Boy
exports.addDeliveryBoy = async (req, res) => {

    try {
      console.log("Received Data:", req.body);

      // Extract required fields
      const { name, phone, email, dob, address, vehicleType, vehicleNumber, licenseNumber, upiId, accountNumber, aadharNumber } = req.body;

      // Validate required fields
      if (!name || !phone || !email || !dob || !address || !vehicleType || !vehicleNumber || !licenseNumber || !upiId || !accountNumber || !aadharNumber) {
        return res.status(400).json({ message: "All fields including selfie are required" });
      }

      // Check for duplicate email
      if (await DeliveryBoy.findOne({ email })) {
        return res.status(400).json({ message: "Email already registered. Use a different email." });
      }

      // Check for duplicate phone
      if (await DeliveryBoy.findOne({ phone })) {
        return res.status(400).json({ message: "Phone number already registered. Use a different number." });
      }

      // Check for duplicate license number
      if (await DeliveryBoy.findOne({ licenseNumber })) {
        return res.status(400).json({ message: "License number already registered. Use a different one." });
      }
      // Check for duplicate Aadhar Number
if (await DeliveryBoy.findOne({ aadharNumber })) {
  return res.status(400).json({ message: "Aadhar number already registered. Use a different one." });
}

    //   if (!req.files || req.files.length === 0) errors.selfie = "At least one selfi image is required";
    //   if (!req.files || req.files.length === 0) errors.aadharPhoto = "At least one aadhar image is required";

    // const selfiePath = req.files.length > 0 ? req.files[0].path : null;
    // const aadharPath = req.files.length > 0 ? req.files[0].path : null;

    if (!req.files || !req.files.selfie || !req.files.aadharPhoto) {
      return res.status(400).json({ message: "Selfie and Aadhar Photo are required." });
    }

    const selfiePath = req.files.selfie[0].path;
    const aadharPath = req.files.aadharPhoto[0].path;

   const  selfie= selfiePath // Store only one image as a string
   const  aadharPhoto= aadharPath // Store only one image as a string



      // Generate OTP
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

      // Create a new Delivery Boy
      const newDeliveryBoy = new DeliveryBoy({
        name,
        phone,
        email,
        dob,
        address,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        upiId,
        accountNumber,
        aadharNumber,
        selfie, // Store selfie image path
        aadharPhoto,
        verificationStatus: "Pending",
        status: "Pending",
        otp, // Store OTP
        otpExpires,
      });
    

      await newDeliveryBoy.save();
    // Send OTP via Email
    await transporter.sendMail({
      to: email,
      subject: "Your OTP for Account Verification",
      html: `<p>Hello <strong>${name}</strong> </p>
      <p>Your OTP for verification is: ${otp}.</p>
             <p>Please use this OTP to complete your registration.</p>
             <p>Thank you.</p>`,
    });

      // Send Registration Details to Admin
      await transporter.sendMail( {
        to: "localestartup@gmail.com",
        subject: "New Delivery Boy Registered",
        text: `
          A new delivery boy has registered:
          - Name: ${name}
          - Email: ${email}
          - Phone: ${phone}
          - DOB: ${dob}
          - Address: ${address}
          - Vehicle Type: ${vehicleType}
          - Vehicle Number: ${vehicleNumber}
          - License Number: ${licenseNumber}
          - Aadhar Number: ${aadharNumber}

          Please verify the details and approve the registration.
        `,
      });

    

      res.status(201).json({ message: "Delivery Boy Registered. OTP Sent for Verification.", data: newDeliveryBoy });

    } catch (error) {
      console.error("Error saving delivery boy:", error.message);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
};
// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required!" });
    }

    console.log("Received:", email, otp);

    // Find user by email
    const user = await DeliveryBoy.findOne({ email });

    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    if (user.otp !== otp.toString()) {  // Convert to string for comparison
      return res.status(400).json({ success: false, message: "Invalid OTP!" });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ success: false, message: "OTP expired!" });
    }

    console.log("OTP verified successfully!");

    // Clear OTP after successful verification
    user.otp = otp;
    user.verificationStatus = "Verified";
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP." });
  }
};



// Resend OTP Function
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required!" });
    }

    const user = await DeliveryBoy.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Generate new OTP and set expiration time (5 mins)
    const newOTP = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Update the user's OTP in the database
    user.otp = newOTP;
    user.otpExpires = otpExpires;
    await user.save();

    // Send the OTP via email
   await transporter.sendMail( {
      to: email,
      subject: "Your OTP Code",
      text: `Your new OTP is: ${newOTP}. It will expire in 5 minutes.`,
    });


    res.status(200).json({ success: true, message: "New OTP sent successfully!" });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
};


// Verify Delivery Boy (Admin action)
exports.verifyDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "Verified" },
      { new: true }
    );
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });
    res.status(200).json({ message: "Delivery Boy Verified", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



// Approve Delivery Boy (Only if Verified)
exports.approveDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });

    if (deliveryBoy.verificationStatus !== "Verified") {
      return res.status(400).json({ message: "Delivery Boy must be verified before approval" });
    }

    deliveryBoy.adminApproval = "Approved";
    await deliveryBoy.save();
    res.status(200).json({ message: "Delivery Boy Approved", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// Update Delivery Status (Picked Up → Going to Delivery → Delivered → Completed)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Picked Up", "Going to Delivery", "Delivered", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid Status Update" });
    }

    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });

    if (deliveryBoy.adminApproval !== "Approved") {
      return res.status(403).json({ message: "Access Denied: Admin approval required" });
    }

    deliveryBoy.status = status;
    await deliveryBoy.save();

    res.status(200).json({ message: `Status Updated to ${status}`, data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



// Get all delivery boys with error handling
exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find({}, { password: 0, otp: 0 }); // Exclude sensitive data
    res.status(200).json({ success: true, data: deliveryBoys });
  } catch (error) {
    console.error("Error fetching delivery boys:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


// Delete a delivery boy
exports.deleteDeliveryBoy = async (req, res) => {
  try {
    const { id } = req.params;
    await DeliveryBoy.findByIdAndDelete(id);
    res.json({ message: "Delivery boy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting delivery boy" });
  }
};



// Delivery Boy Login Controller
exports.loginDeliveryBoy = async (req, res) => {
  try {
    const { email, dob } = req.body;
    console.log("Received Data:", email, dob);

    if (!email || !dob) {
      return res.status(400).json({ success: false, message: "Email and DOB are required" });
    }

    // Ensure DOB format matches
    const formattedDob = new Date(dob).toISOString().split("T")[0];

    const deliveryBoy = await DeliveryBoy.findOne({ email, dob: formattedDob });

    if (!deliveryBoy) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
console.log(deliveryBoy.verificationStatus, deliveryBoy.adminApproval);
    if (deliveryBoy.verificationStatus !== "Verified"|| deliveryBoy.adminApproval !== "Approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified by the admin. Please wait for approval.",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      verified: true,
      deliveryBoyId: deliveryBoy._id,
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
