const mongoose = require("mongoose");
const { Schema } = mongoose;
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      minLength: [3, "Name must be at least 3 characters"],
      maxLength: [50, "Name must be less than 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true, // Unique constraint for email
      lowercase: true,
    },
    password: {
      type: String,
      select: false, // Exclude password by default in queries
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Password hashing before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // If password is not modified, skip hashing
  }

  try {
    // Hash password before saving to the database
    this.password = await bcrypt.hash(this.password, 10);
    next(); // Continue with save operation
  } catch (err) {
    return next(err); // Handle any errors during hashing
  }
});

// Add JWT token method to userSchema
userSchema.methods = {
  jwtToken() {
    // Check if SECRET exists in environment variables
    if (!process.env.SECRET) {
      throw new Error("JWT secret is missing from environment variables");
    }

    // Create JWT token and set expiration to 24 hours
    return JWT.sign(
      {
        id: this._id, // Include user ID in token payload
        email: this.email, // Include email in token payload
      },
      process.env.SECRET, // Use secret key from environment variable
      { expiresIn: "24h" } // Set expiration for the token
    );
  },

  // Method to compare password during login
  comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  },
};

// Create user model from the schema
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
