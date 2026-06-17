const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true // index student names for fast sub-document searching
  },
  photoUrl: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  passGenerated: {
    type: Boolean,
    default: false
  },
  validFrom: {
    type: Date,
    default: null
  },
  validTo: {
    type: Date,
    default: null
  },
  printedAt: {
    type: Date,
    default: null
  }
});

const submissionSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    groupName: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'partially_approved', 'archived'],
      default: 'pending',
      index: true
    },
    students: [studentSchema]
  },
  {
    timestamps: true
  }
);

// Compound indexes for common query patterns
submissionSchema.index({ status: 1, createdAt: -1 });   // default dashboard sort
submissionSchema.index({ createdAt: -1 });               // timeline sort
submissionSchema.index({ phoneNumber: 1 });              // phone search
submissionSchema.index({ 'students._id': 1 });           // bulk action $in lookup
submissionSchema.index({ requestId: 1, phoneNumber: 1 });// combined SC- / digit search ($or)

module.exports = mongoose.model('Submission', submissionSchema);
