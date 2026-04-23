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
    console.log("Connected to MongoDB for deeper cleanup...");

    const allUsers = await User.find({}).lean();
    console.log(`Checking ${allUsers.length} users...`);

    let fixedCount = 0;
    for (const u of allUsers) {
      if (u.classId && typeof u.classId === 'string' && u.classId.length < 10) {
        console.log(`Found suspect classId "${u.classId}" for user ${u.email}. Resetting to null.`);
        await User.updateOne({ _id: u._id }, { $set: { classId: null } });
        fixedCount++;
      }
    }

    console.log(`Deeper cleanup complete. Fixed ${fixedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
