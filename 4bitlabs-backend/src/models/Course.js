const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  duration: { type: String, default: '' }, // e.g. "24:15"
  thumbnailUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
  topic: { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, enum: ['pdf', 'doc', 'link', 'zip'], default: 'link' },
    },
  ],
});

const buildProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  steps: [{ stepNumber: Number, instruction: String, codeSnippet: String }],
  resources: [{ title: String, url: String }],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: 'General' },
    lectures: [lectureSchema],
    buildProjects: [buildProjectSchema],
    enrolledCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

// Index for efficient querying per school
courseSchema.index({ schoolId: 1, isPublished: 1 });

module.exports = mongoose.model('Course', courseSchema);
