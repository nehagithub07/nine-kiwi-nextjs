import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reportId: String,
    status: String,
    inspectorName: String,
    clientName: String,
    companyName: String,
    nameandAddressOfCompany: String,
    contactPhone: String,
    contactEmail: String,
    location: String,
    streetAddress: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    lat: String,
    lon: String,
    inspectionDate: String,
    startInspectionTime: String,
    workProgress: String,
    safetyCompliance: String,
    safetySignage: String,
    scheduleCompliance: String,
    materialAvailability: String,
    workerAttendance: String,
    additionalComments: String,
    inspectorSummary: String,
    recommendations: String,
    backgroundManual: String,
    backgroundAuto: String,
    fieldObservationText: String,
    signatureData: String,
    temperature: String,
    humidity: String,
    windSpeed: String,
    weatherDescription: String,
  },
  { timestamps: true }
);

ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ reportId: 1 });

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
