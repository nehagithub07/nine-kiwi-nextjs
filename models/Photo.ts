import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
    name: { type: String },
    // Either base64/dataURL or a remote URL
    data: { type: String },
    url: { type: String },
    caption: { type: String },
    section: { type: String, default: "fieldObservation" },
    includeInSummary: { type: Boolean },
    figureNumber: { type: Number },
    description: { type: String },
  },
  { timestamps: true }
);

PhotoSchema.index({ reportId: 1, createdAt: -1 });

export default mongoose.models.Photo || mongoose.model("Photo", PhotoSchema);
