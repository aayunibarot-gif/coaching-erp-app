import mongoose from "mongoose";

export const validateObjectId = (id) => {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
};
