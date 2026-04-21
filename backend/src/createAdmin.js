import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const email = "admin@erp.com";
    const password = "admin123";

    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.password = hashedPassword;
      user.role = "admin";
      user.isApproved = true;
      await user.save();
      console.log("Admin password has been RESET!");
    } else {
      await User.create({
        name: "Super Admin",
        email: email,
        password: hashedPassword,
        role: "admin",
        isApproved: true,
      });
      console.log("Admin User Created Successfully!");
    }

    console.log("-----------------------------------------");
    console.log("Admin User Created Successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
