require('dotenv').config();
const College = require('../models/College');
const Subject = require('../models/Subject');
const connectDB = require('../config/database');

const knitSubjects = [
  // Semester 1
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'BAS-103', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Programming for Problem Solving (C)', shortName: 'PPS', code: 'BCS-101', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Engineering Physics', shortName: 'Physics', code: 'BAS-101', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Basic Electrical Engineering', shortName: 'BEE', code: 'BEE-101', branch: 'Information Technology', semester: 1, unitsCount: 5 },

  // Semester 2
  { name: 'Engineering Mathematics II', shortName: 'Maths-2', code: 'BAS-203', branch: 'Information Technology', semester: 2, unitsCount: 5 },
  { name: 'Engineering Chemistry', shortName: 'Chemistry', code: 'BAS-202', branch: 'Information Technology', semester: 2, unitsCount: 5 },
  { name: 'Basic Electronics Engineering', shortName: 'Electronics', code: 'BEC-201', branch: 'Information Technology', semester: 2, unitsCount: 5 },

  // Semester 3
  { name: 'Data Structures', shortName: 'DS', code: 'BCS-301', branch: 'Information Technology', semester: 3, unitsCount: 5 },
  { name: 'Computer Organization & Architecture', shortName: 'COA', code: 'BCS-302', branch: 'Information Technology', semester: 3, unitsCount: 5 },
  { name: 'Discrete Structures & Graph Theory', shortName: 'Discrete Maths', code: 'BCS-303', branch: 'Information Technology', semester: 3, unitsCount: 5 },

  // Semester 4
  { name: 'Operating Systems', shortName: 'OS', code: 'BCS-401', branch: 'Information Technology', semester: 4, unitsCount: 5 },
  { name: 'Theory of Automata & Formal Languages', shortName: 'TAFL', code: 'BCS-402', branch: 'Information Technology', semester: 4, unitsCount: 5 },
  { name: 'Object Oriented Programming with Java', shortName: 'OOPS', code: 'BCS-403', branch: 'Information Technology', semester: 4, unitsCount: 5 },

  // Semester 5
  { name: 'Database Management Systems', shortName: 'DBMS', code: 'BIT-501', branch: 'Information Technology', semester: 5, unitsCount: 5 },
  { name: 'Design & Analysis of Algorithms', shortName: 'DAA', code: 'BCS-502', branch: 'Information Technology', semester: 5, unitsCount: 5 },
  { name: 'Software Engineering', shortName: 'SE', code: 'BIT-502', branch: 'Information Technology', semester: 5, unitsCount: 5 },

  // Semester 6
  { name: 'Computer Networks', shortName: 'CN', code: 'BIT-601', branch: 'Information Technology', semester: 6, unitsCount: 5 },
  { name: 'Compiler Design', shortName: 'CD', code: 'BCS-602', branch: 'Information Technology', semester: 6, unitsCount: 5 },
  { name: 'Web Technology', shortName: 'WT', code: 'BIT-602', branch: 'Information Technology', semester: 6, unitsCount: 5 },

  // Semester 7
  { name: 'Cloud Computing', shortName: 'CC', code: 'BIT-701', branch: 'Information Technology', semester: 7, unitsCount: 5 },
  { name: 'Artificial Intelligence & Machine Learning', shortName: 'AI/ML', code: 'BCS-701', branch: 'Information Technology', semester: 7, unitsCount: 5 },
  { name: 'Information & Cyber Security', shortName: 'ICS', code: 'BIT-702', branch: 'Information Technology', semester: 7, unitsCount: 5 }
];

const seedAcademic = async () => {
  try {
    await connectDB();

    const knit = await College.findOne({ code: 'KNIT' });
    if (!knit) {
      console.error('KNIT college not found. Please run seedColleges.js first.');
      process.exit(1);
    }

    for (const sub of knitSubjects) {
      await Subject.findOneAndUpdate(
        { code: sub.code, collegeId: knit._id },
        { ...sub, collegeId: knit._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(`[Seed Academic] ${knitSubjects.length} subjects seeded for KNIT Sultanpur successfully.`);
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`[Seed Academic Error] ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedAcademic();
}

module.exports = seedAcademic;
