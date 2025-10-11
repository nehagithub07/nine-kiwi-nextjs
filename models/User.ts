import { Schema, model, models } from "mongoose";


export type UserRole = "user" | "admin";


export interface IUser {
name: string;
email: string;
passwordHash: string;  
role: UserRole;
avatarUrl?: string;  
createdAt: Date;
updatedAt: Date;
}


const UserSchema = new Schema<IUser>(
{
name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, index: true },
passwordHash: { type: String, required: true },
role: { type: String, enum: ["user", "admin"], default: "user" },
avatarUrl: { type: String },
},
{ timestamps: true }
);


export const User = models.User || model<IUser>("User", UserSchema);