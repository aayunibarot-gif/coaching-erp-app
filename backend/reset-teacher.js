import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

async function resetTeacherPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = "teacher@erp.com";
    const newPassword = "Teacher@123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      console.log("Teacher password reset to: Teacher@123");
    } else {
      console.log("Teacher NOT found");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetTeacherPassword();
