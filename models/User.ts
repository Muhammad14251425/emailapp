import mongoose from "mongoose";

export interface IUser extends Document {
  name: string
  email: string[]
  createdAt: Date
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Optional name
  email: { type: [String], required: true }, // Array of emails (Required)
  createdAt: { type: Date, default: Date.now }, // Default timestamp
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
