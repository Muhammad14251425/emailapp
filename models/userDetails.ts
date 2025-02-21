import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDetails extends Document {
  password: string;
  refreshToken?: string;
  accessToken?: string;
  authenticated: "authenticated" | "unauthenticated";
  time: Date;
}

const userDetailsSchema: Schema<IUserDetails> = new Schema(
  {
    password: { type: String, required: true },
    refreshToken: { type: String },
    accessToken: { type: String },
    authenticated: {
      type: String,
      enum: ["authenticated", "unauthenticated"],
      default: "unauthenticated",
    },
    time: { type: Date, default: Date.now }, // Automatically set to the current time
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

const UserDetails: Model<IUserDetails> =
  mongoose.models.UserDetails || mongoose.model<IUserDetails>("UserDetails", userDetailsSchema);

export default UserDetails;
