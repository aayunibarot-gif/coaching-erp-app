import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for cleanup...");

    const users = await User.find({});
    let fixedCount = 0;

    for (const user of users) {
      if (user.classId && !mongoose.Types.ObjectId.isValid(user.classId)) {
        console.log(`Fixing invalid classId for user: ${user.email} (Value: ${user.classId})`);
        user.classId = null;
        await user.save();
        fixedCount++;
      }
    }

    console.log(`Cleanup complete. Fixed ${fixedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
