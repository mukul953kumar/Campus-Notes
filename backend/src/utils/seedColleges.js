require('dotenv').config();
const mongoose = require('mongoose');
const College = require('../models/College');
const connectDB = require('../config/database');

const defaultColleges = [
  {
    name: 'Delhi Technological University',
    code: 'DTU',
    allowedDomains: ['dtu.ac.in'],
    branches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electronics & Comm', 'Mechanical']
  },
  {
    name: 'Netaji Subhas University of Technology',
    code: 'NSUT',
    allowedDomains: ['nsut.ac.in'],
    branches: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical']
  },
  {
    name: 'Demo University',
    code: 'DEMO',
    allowedDomains: ['college.edu', 'student.edu', 'gmail.com'],
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
