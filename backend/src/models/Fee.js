import mongoose from "mongoose";

const feesSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  totalFees: {
    type: Number,
    required: true
  },
  paid: {
    type: Number,
    required: true
  },
  remaining: {
    type: Number,
    required: true
  }
});

export default mongoose.model("Fees", feesSchema);