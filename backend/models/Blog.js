const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // The HTML from the Quill editor

    // Media URLs (Saved in public/uploads)
    coverImg: { type: String }, // URL for the blog card thumbnail
    bgImg: { type: String },    // URL for the hero banner background
    audioUrl: { type: String }, // URL for the uploaded audio narration

    // Author Dossier
    authorDetails: {
        name: { type: String, default: "MLS Admin" },
        role: { type: String },      // Replaced 'profession/workplace' to match frontend
        bio: { type: String },
        photo: { type: String }      // URL to the cropped author image
    },

    tag: { type: String, default: "Insight" },
    date: { type: String, default: () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
    isFeatured: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);