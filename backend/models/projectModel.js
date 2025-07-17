const mongoose = require("mongoose");

let projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  projLanguage: {
    type: String,
    required: true,
    enum: ["python", "java", "javascript", "cpp", "c", "go", "bash", "placeholder"]
  },
  code: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: String,
    required: true,
  },
  runtime: {
    type: String,
    required: false,
    default: function() {
      // Default runtime based on language if not provided
      const langToRuntime = {
        'javascript': 'node',
        'python': 'python',
        'cpp': 'gcc',
        'c': 'gcc',
        'java': 'java',
        'bash': 'bash',
        'go': 'go'
      };
      return langToRuntime[this.projLanguage] || this.projLanguage;
    }
  }
});

module.exports = mongoose.model("Project", projectSchema);