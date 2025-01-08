const userModel = require("../model/userSchema");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signup function

const signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log(name, email, password, confirmPassword);

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Every field is required",
    });
  }

  const validEmail = emailValidator.validate(email);
  if (!validEmail) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email id",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and confirm password don't match",
    });
  }

  try {
    // Check if the email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Account already exists with provided email id",
      });
    }

    // Create a new user
    const userInfo = new userModel({ name, email, password });
    const result = await userInfo.save();

    return res.status(200).json({
      success: true,
      data: result,
      message: "Sign Up Successful",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// Signin function
// const signin = async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Every field is mandatory",
//     });
//   }

//   try {
//     const user = await userModel.findOne({ email });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Credentials",
//       });
//     }

//     const token = user.jwtToken();
//     user.password = undefined; // Do not send password in response

//     const cookieOptions = {
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//       httpOnly: true, // Prevents client-side JavaScript from accessing cookie
//       secure: process.env.NODE_ENV === 'production', // Secure cookie only in production with HTTPS
//       sameSite: 'Strict', // Secure cookie options
//     };

//     res.cookie("token", token, cookieOptions);

//     return res.status(200).json({
//       success: true,
//       data: user,
//       message: "Signin Successful",
//     });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };
const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Every field is mandatory",
    });
  }

  try {
    const user = await userModel.findOne({ email }).select("password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = user.jwtToken(); // This should return a valid JWT

    // Log the token to ensure it’s generated correctly
    console.log("Generated Token:", token);

    // Set password to undefined before sending user data
    user.password = undefined;

    // Check if the token is undefined
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong during token generation",
      });
    }

    // Set cookie options and send the token as a cookie
    const cookieOption = {
      maxAge: 24 * 60 * 60 * 1000, // Token expiration (1 day)
      httpOnly: true,
    };
    res.cookie("token", token, cookieOption);

    // Send back the user data along with the token
    res.status(200).json({
      success: true,
      data: user,
      token, // Ensure token is sent as part of the response
    });
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(400).json({
      success: false,
      message: "Something went wrong during signin",
      error: err.message,
    });
  }
};





// Get user details function
const getUser = async (req, res, next) => {
  const userId = req.user.id; // user info added by jwtAuth middleware
  try {
    const user = await userModel.findById(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// Logout function
const logout = async (req, res) => {
  try {
    const cookieOptions = {
      expires: new Date(0), // Setting expiration to past time to remove the cookie
      httpOnly: true,
    };
    res.cookie("token", null, cookieOptions); // Clear the token cookie
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Error occurred during logout",
    });
  }
};

module.exports = { signup, signin, getUser, logout };
