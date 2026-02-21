const mongoose = require('mongoose');

const screenshotSchema = mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'New Screenshot',
    },
    category: {
      type: String,
      enum: ['Task', 'Note', 'Reminder', 'General'],
      default: 'General',
    },
    mode: {
      type: String,
      enum: ['Notes', 'Task', 'Reminder', 'OCR', 'Info', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      default: 'Medium',
    },
    status: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
    },
    suggestedDate: {
      type: String,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Screenshot', screenshotSchema);