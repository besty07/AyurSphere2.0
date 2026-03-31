import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, mobile, age, gender, address, medicalHistory, password, otp } = req.body;

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify OTP if trying to change password
    if (password) {
      if (!otp) {
        return res.status(400).json({ message: 'OTP is required to change your password' });
      }
      if (otp !== '123456') {
        return res.status(400).json({ message: 'Invalid OTP entered' });
      }
    }

    // Update password if provided
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update other fields
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (mobile !== undefined) user.mobile = mobile;
    if (age !== undefined) user.age = Number(age);
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;

    // Handle Profile Picture Upload
    if (req.file) {
      // The file is saved inside public/uploads by multer. We serve public statically.
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Do not return password in response
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    // In a real app, integrate Twilio/SNS here
    console.log(`[MOCK SMS] Sending OTP "123456" to mobile number registered with User ID: ${req.user.id}`);
    res.json({ message: 'Secure verification code dispatched perfectly to Mobile!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to dispatch mockup OTP.', error: error.message });
  }
};
