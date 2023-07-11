// Load environment variable
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Create app
const app = express();

// JSON body set up
app.use(express.json());

// MongoDb connection setup
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Create a User model based on the schema
const User = mongoose.model('User', userSchema);

// Create a POST endpoint for user registration
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists in the database
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    // Send a confirmation email to the user
    sendConfirmationEmail(email);

    // Respond with a success status
    res.sendStatus(204);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a POST endpoint for user login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate an access token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond with the access token
    res.status(200).json({ token: token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a POST endpoint for changing password
app.post('/api/actions/changepassword', async (req, res) => {
  try {
    // Get the current user from the token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Compare the provided old password with the stored hashed password
    const isOldPasswordValid = await bcrypt.compare(req.body.old_password, user.password);

    if (!isOldPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(req.body.new_password, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    // Respond with a success status
    res.sendStatus(200);
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a GET endpoint for user profile
app.get('/api/profiles', async (req, res) => {
  try {
    // Get the current user from the token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Respond with the user's personal information
    res.status(200).json({ username: user.username, email: user.email });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Function to send a confirmation email
function sendConfirmationEmail(email) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account Confirmation',
    text: 'Thank you for registering an account!',
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
