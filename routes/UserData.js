const express = require('express');
const { register, verifyOtp, login, getUserCount, getUsers , sendOTP , resetPassword , deleteUserById , resendOtp , updateUserProfile } = require('../controllers/userController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/count',getUserCount);
router.get('/getusers',getUsers);


router.post('/send-otp', sendOTP);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);
router.delete('/deleteUser/:userId',deleteUserById); 
router.put("/update/:userId", updateUserProfile);
module.exports = router;
