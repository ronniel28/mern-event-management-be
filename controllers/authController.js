const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register new User
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try{
        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role });
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),      
        });

    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the password matches
      const isPasswordMatch = await user.matchPassword(password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token with user ID and role
      const token = generateToken(user._id, user.role);
  
      // Send the response back to the frontend with relevant user data and token
      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // Include the token in the response
      });
  
    } catch (err) {
      console.error('Login Error:', err);
      return res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  };

module.exports = { registerUser, loginUser };