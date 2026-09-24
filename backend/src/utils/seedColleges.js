require('dotenv').config();
const mongoose = require('mongoose');
const College = require('../models/College');
const connectDB = require('../config/database');

const defaultColleges = [
  {
    name: 'Kamla Nehru Institute of Technology',
    code: 'KNIT',
    allowedDomains: ['knit.ac.in'],
    branches: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Master of Computer Applications'
    ]
  },
  {
    name: 'Delhi Technological University',
    code: 'DTU',
    allowedDomains: ['dtu.ac.in'],
    branches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electronics & Comm', 'Mechanical']
  },
  {
    name: 'Demo University',
    code: 'DEMO',
    allowedDomains: ['college.edu', 'student.edu'],
    branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
  }
];

const seedColleges = async () => {
  try {
    await connectDB();

    for (const collegeData of defaultColleges) {
      await College.findOneAndUpdate(
        { code: collegeData.code },
        collegeData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('[Seed] Default colleges seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed colleges: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedColleges();
}

module.exports = seedColleges;
