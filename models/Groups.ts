import mongoose from "mongoose";

export interface IGroup extends Document {
  name: string
  priority: number
  emails: string[]
}

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Group name
  priority: { type: Number, required: true }, // Priority level
  emails: {
    type: [String],
    required: true,
  },
});

// Creating a Groups collection
export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
