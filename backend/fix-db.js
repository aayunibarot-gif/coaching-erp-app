import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function fixDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in .env file!");
      process.exit(1);
    }
    console.log("Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("Connected!");

    const db = mongoose.connection.db;
    const collection = db.collection("classes");

    console.log("Checking indexes...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    if (indexes.some(i => i.name === "standardName_1")) {
      console.log("Dropping unique index 'standardName_1'...");
      await collection.dropIndex("standardName_1");
      console.log("Successfully dropped the unique index!");
    } else {
      console.log("Unique index not found, it might have been dropped already.");
    }

    console.log("Database fix complete. You can now add multiple batches for the same standard.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to fix database:", error);
    process.exit(1);
  }
}

fixDatabase();
