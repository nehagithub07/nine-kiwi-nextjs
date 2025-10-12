import mongoose from "mongoose";

const AdminDashboardSchema = new mongoose.Schema(
  {
    // One preferences doc per admin user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // List page settings
    itemsPerPage: { type: Number, default: 10, min: 5, max: 100 },
    statusFilter: {
      type: String,
      enum: ["all", "Completed", "In Progress", "On Track"],
      default: "all",
    },
    dateFilter: {
      type: String,
      enum: ["all", "7days", "30days", "90days"],
      default: "all",
    },
    sortBy: {
      type: String,
      enum: ["createdAt", "inspectionDate", "reportId"],
      default: "createdAt",
    },
    sortDir: { type: String, enum: ["asc", "desc"], default: "desc" },

    // Optional saved views (named filters)
    savedViews: [
      {
        name: { type: String, required: true, trim: true },
        statusFilter: { type: String, enum: ["all", "Completed", "In Progress", "On Track"], default: "all" },
        dateFilter: { type: String, enum: ["all", "7days", "30days", "90days"], default: "all" },
        searchTerm: { type: String, default: "" },
        sortBy: { type: String, enum: ["createdAt", "inspectionDate", "reportId"], default: "createdAt" },
        sortDir: { type: String, enum: ["asc", "desc"], default: "desc" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

AdminDashboardSchema.index({ userId: 1 }, { unique: true });

export default mongoose.models.AdminDashboard ||
  mongoose.model("AdminDashboard", AdminDashboardSchema);

