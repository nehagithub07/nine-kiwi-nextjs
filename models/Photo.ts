import { Schema, model, models, Types } from "mongoose";


export interface IPhoto {
reportId?: string; // optional free-form id you already use in UI
section?: string; // e.g. "background", "fieldObservation"
name: string;
src: string; // Cloudinary URL (or data URL if needed)
includeInSummary?: boolean;
caption?: string;
description?: string;
figureNumber?: number;
uploadedBy?: Types.ObjectId; // reference to User
createdAt: Date;
updatedAt: Date;
}


const PhotoSchema = new Schema<IPhoto>(
{
reportId: { type: String },
section: { type: String },
name: { type: String, required: true },
src: { type: String, required: true },
includeInSummary: { type: Boolean, default: false },
caption: { type: String },
description: { type: String },
figureNumber: { type: Number },
uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
},
{ timestamps: true }
);


export const Photo = models.Photo || model<IPhoto>("Photo", PhotoSchema);