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
    const { email, mobile, age, gender, address, medicalHistory, password } = req.body;
    
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update password if provided
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update other fields
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
