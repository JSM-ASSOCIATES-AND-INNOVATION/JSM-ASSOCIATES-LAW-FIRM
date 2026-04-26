const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  residentialAddress: { type: String, required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  coverLetter: { type: String },
  disputeType: { type: String, required: true },
  preferredMode: { type: String, required: true },
  cgpa: { type: String },

  // File URLs
  cvUrl: { type: String, required: true },
  researchSampleUrl: { type: String },
  marksSheetUrl: { type: String },
  draftSampleUrl: { type: String },

  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
