// models/Photo.ts
import { Schema, model, models } from "mongoose";

export interface IPhoto {
  reportId: string;          // link to a report
  section: string;           // "weather" | "safety" | "work" | etc.
  name: string;
  src?: string;              // remote URL or data URL (optional)
  includeInSummary?: boolean;
  caption?: string;
  description?: string;
  figureNumber?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    reportId: { type: String, required: true, index: true },
    section:  { type: String, required: true, index: true },
    name:     { type: String, required: true },
    src:      { type: String },
    includeInSummary: { type: Boolean, default: false },
    caption:  { type: String },
    description: { type: String },
    figureNumber: { type: Number },
  },
  { timestamps: true }
);

export const Photo = models.Photo || model<IPhoto>("Photo", PhotoSchema);
