// models/Report.ts
import { Schema, model, models, Types } from "mongoose";

export interface IReport {
  // Identity & meta
  reportId?: string;
  status?: "In Progress" | "Completed" | "On Track" | "";
  inspectionDate?: string;      // YYYY-MM-DD
  startInspectionTime?: string; // HH:mm
  inspectorName?: string;
  clientName?: string;
  companyName?: string;
  nameandAddressOfCompany?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Location
  location?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;

  // Coords
  lat?: string | number;
  lon?: string | number;

  // Narrative
  workProgress?: string;
  safetyCompliance?: string;
  safetySignage?: string;
  scheduleCompliance?: string;
  materialAvailability?: string;
  workerAttendance?: string;
  additionalComments?: string;
  inspectorSummary?: string;
  recommendations?: string;
  backgroundManual?: string;
  backgroundAuto?: string;
  fieldObservationText?: string;

  // Weather
  temperature?: string | number;
  humidity?: string | number;
  windSpeed?: string | number;
  weatherDescription?: string;

  // Signature
  signatureData?: string;

  // Ownership
  ownerId?: Types.ObjectId;

  // Mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportId: { type: String, index: true },
    status: { type: String },
    inspectionDate: { type: String },
    startInspectionTime: { type: String },
    inspectorName: { type: String },
    clientName: { type: String },
    companyName: { type: String },
    nameandAddressOfCompany: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },

    location: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },

    lat: { type: Schema.Types.Mixed },
    lon: { type: Schema.Types.Mixed },

    workProgress: { type: String },
    safetyCompliance: { type: String },
    safetySignage: { type: String },
    scheduleCompliance: { type: String },
    materialAvailability: { type: String },
    workerAttendance: { type: String },
    additionalComments: { type: String },
    inspectorSummary: { type: String },
    recommendations: { type: String },
    backgroundManual: { type: String },
    backgroundAuto: { type: String },
    fieldObservationText: { type: String },

    temperature: { type: Schema.Types.Mixed },
    humidity: { type: Schema.Types.Mixed },
    windSpeed: { type: Schema.Types.Mixed },
    weatherDescription: { type: String },

    signatureData: { type: String },

    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Report = models.Report || model<IReport>("Report", ReportSchema);
