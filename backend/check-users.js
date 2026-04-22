import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await User.countDocuments();
    const teacher = await User.findOne({ email: "teacher@erp.com" });
    console.log("Total users:", count);
    if (teacher) {
      console.log("Teacher found:", teacher.email, "Role:", teacher.role);
    } else {
      console.log("Teacher NOT found");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
