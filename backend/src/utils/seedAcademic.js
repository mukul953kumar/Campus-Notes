require('dotenv').config();
const College = require('../models/College');
const Subject = require('../models/Subject');
const connectDB = require('../config/database');

const knitSubjects = [
  // Common 1st Year (Semester 1 & 2) for All Engineering Branches
  // Semester 1
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'BAS-103', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Programming for Problem Solving (C)', shortName: 'PPS', code: 'BCS-101', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Engineering Physics', shortName: 'Physics', code: 'BAS-101', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Basic Electrical Engineering', shortName: 'BEE', code: 'BEE-101', branch: 'Information Technology', semester: 1, unitsCount: 5 },
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'CSE-BAS-103', branch: 'Computer Science & Engineering', semester: 1, unitsCount: 5 },
  { name: 'Programming for Problem Solving (C)', shortName: 'PPS', code: 'CSE-BCS-101', branch: 'Computer Science & Engineering', semester: 1, unitsCount: 5 },
  { name: 'Engineering Physics', shortName: 'Physics', code: 'CSE-BAS-101', branch: 'Computer Science & Engineering', semester: 1, unitsCount: 5 },
  { name: 'Basic Electrical Engineering', shortName: 'BEE', code: 'CSE-BEE-101', branch: 'Computer Science & Engineering', semester: 1, unitsCount: 5 },
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'ECE-BAS-103', branch: 'Electronics Engineering', semester: 1, unitsCount: 5 },
  { name: 'Engineering Physics', shortName: 'Physics', code: 'ECE-BAS-101', branch: 'Electronics Engineering', semester: 1, unitsCount: 5 },
  { name: 'Basic Electrical Engineering', shortName: 'BEE', code: 'ECE-BEE-101', branch: 'Electronics Engineering', semester: 1, unitsCount: 5 },
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'EE-BAS-103', branch: 'Electrical Engineering', semester: 1, unitsCount: 5 },
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'ME-BAS-103', branch: 'Mechanical Engineering', semester: 1, unitsCount: 5 },
  { name: 'Engineering Mathematics I', shortName: 'Maths-1', code: 'CE-BAS-103', branch: 'Civil Engineering', semester: 1, unitsCount: 5 },

  // Semester 2
  { name: 'Engineering Mathematics II', shortName: 'Maths-2', code: 'BAS-203', branch: 'Information Technology', semester: 2, unitsCount: 5 },
  { name: 'Engineering Chemistry', shortName: 'Chemistry', code: 'BAS-202', branch: 'Information Technology', semester: 2, unitsCount: 5 },
  { name: 'Basic Electronics Engineering', shortName: 'Electronics', code: 'BEC-201', branch: 'Information Technology', semester: 2, unitsCount: 5 },
  { name: 'Engineering Mathematics II', shortName: 'Maths-2', code: 'CSE-BAS-203', branch: 'Computer Science & Engineering', semester: 2, unitsCount: 5 },
  { name: 'Engineering Chemistry', shortName: 'Chemistry', code: 'CSE-BAS-202', branch: 'Computer Science & Engineering', semester: 2, unitsCount: 5 },
  { name: 'Basic Electronics Engineering', shortName: 'Electronics', code: 'CSE-BEC-201', branch: 'Computer Science & Engineering', semester: 2, unitsCount: 5 },
  { name: 'Engineering Mathematics II', shortName: 'Maths-2', code: 'ECE-BAS-203', branch: 'Electronics Engineering', semester: 2, unitsCount: 5 },
  { name: 'Engineering Chemistry', shortName: 'Chemistry', code: 'ECE-BAS-202', branch: 'Electronics Engineering', semester: 2, unitsCount: 5 },

  // Computer Science & Engineering (Semesters 3 - 8)
  { name: 'Data Structures', shortName: 'DS', code: 'CSE-BCS-301', branch: 'Computer Science & Engineering', semester: 3, unitsCount: 5 },
  { name: 'Computer Organization & Architecture', shortName: 'COA', code: 'CSE-BCS-302', branch: 'Computer Science & Engineering', semester: 3, unitsCount: 5 },
  { name: 'Discrete Structures & Graph Theory', shortName: 'Discrete Maths', code: 'CSE-BCS-303', branch: 'Computer Science & Engineering', semester: 3, unitsCount: 5 },
  { name: 'Operating Systems', shortName: 'OS', code: 'CSE-BCS-401', branch: 'Computer Science & Engineering', semester: 4, unitsCount: 5 },
  { name: 'Theory of Automata & Formal Languages', shortName: 'TAFL', code: 'CSE-BCS-402', branch: 'Computer Science & Engineering', semester: 4, unitsCount: 5 },
  { name: 'Object Oriented Programming with Java', shortName: 'OOPS', code: 'CSE-BCS-403', branch: 'Computer Science & Engineering', semester: 4, unitsCount: 5 },
  { name: 'Database Management Systems', shortName: 'DBMS', code: 'CSE-BCS-501', branch: 'Computer Science & Engineering', semester: 5, unitsCount: 5 },
  { name: 'Design & Analysis of Algorithms', shortName: 'DAA', code: 'CSE-BCS-502', branch: 'Computer Science & Engineering', semester: 5, unitsCount: 5 },
  { name: 'Software Engineering', shortName: 'SE', code: 'CSE-BCS-503', branch: 'Computer Science & Engineering', semester: 5, unitsCount: 5 },
  { name: 'Computer Networks', shortName: 'CN', code: 'CSE-BCS-601', branch: 'Computer Science & Engineering', semester: 6, unitsCount: 5 },
  { name: 'Compiler Design', shortName: 'CD', code: 'CSE-BCS-602', branch: 'Computer Science & Engineering', semester: 6, unitsCount: 5 },
  { name: 'Web Technology', shortName: 'WT', code: 'CSE-BCS-603', branch: 'Computer Science & Engineering', semester: 6, unitsCount: 5 },
  { name: 'Artificial Intelligence & Machine Learning', shortName: 'AI/ML', code: 'CSE-BCS-701', branch: 'Computer Science & Engineering', semester: 7, unitsCount: 5 },
  { name: 'Cloud Computing', shortName: 'CC', code: 'CSE-BCS-702', branch: 'Computer Science & Engineering', semester: 7, unitsCount: 5 },
  { name: 'Distributed Systems', shortName: 'DS-Dist', code: 'CSE-BCS-801', branch: 'Computer Science & Engineering', semester: 8, unitsCount: 5 },

  // Information Technology (Semesters 3 - 8)
  { name: 'Data Structures', shortName: 'DS', code: 'BCS-301', branch: 'Information Technology', semester: 3, unitsCount: 5 },
  { name: 'Computer Organization & Architecture', shortName: 'COA', code: 'BCS-302', branch: 'Information Technology', semester: 3, unitsCount: 5 },
  { name: 'Discrete Structures & Graph Theory', shortName: 'Discrete Maths', code: 'BCS-303', branch: 'Information Technology', semester: 3, unitsCount: 5 },
  { name: 'Operating Systems', shortName: 'OS', code: 'BCS-401', branch: 'Information Technology', semester: 4, unitsCount: 5 },
  { name: 'Theory of Automata & Formal Languages', shortName: 'TAFL', code: 'BCS-402', branch: 'Information Technology', semester: 4, unitsCount: 5 },
  { name: 'Object Oriented Programming with Java', shortName: 'OOPS', code: 'BCS-403', branch: 'Information Technology', semester: 4, unitsCount: 5 },
  { name: 'Database Management Systems', shortName: 'DBMS', code: 'BIT-501', branch: 'Information Technology', semester: 5, unitsCount: 5 },
  { name: 'Design & Analysis of Algorithms', shortName: 'DAA', code: 'BCS-502', branch: 'Information Technology', semester: 5, unitsCount: 5 },
  { name: 'Software Engineering', shortName: 'SE', code: 'BIT-502', branch: 'Information Technology', semester: 5, unitsCount: 5 },
  { name: 'Computer Networks', shortName: 'CN', code: 'BIT-601', branch: 'Information Technology', semester: 6, unitsCount: 5 },
  { name: 'Compiler Design', shortName: 'CD', code: 'BCS-602', branch: 'Information Technology', semester: 6, unitsCount: 5 },
  { name: 'Web Technology', shortName: 'WT', code: 'BIT-602', branch: 'Information Technology', semester: 6, unitsCount: 5 },
  { name: 'Cloud Computing', shortName: 'CC', code: 'BIT-701', branch: 'Information Technology', semester: 7, unitsCount: 5 },
  { name: 'Artificial Intelligence & Machine Learning', shortName: 'AI/ML', code: 'BCS-701', branch: 'Information Technology', semester: 7, unitsCount: 5 },
  { name: 'Information & Cyber Security', shortName: 'ICS', code: 'BIT-702', branch: 'Information Technology', semester: 7, unitsCount: 5 },
  { name: 'Internet of Things (IoT)', shortName: 'IoT', code: 'BIT-801', branch: 'Information Technology', semester: 8, unitsCount: 5 },

  // Electronics Engineering
  { name: 'Electronic Devices & Circuits', shortName: 'EDC', code: 'BEC-301', branch: 'Electronics Engineering', semester: 3, unitsCount: 5 },
  { name: 'Signals & Systems', shortName: 'SS', code: 'BEC-302', branch: 'Electronics Engineering', semester: 3, unitsCount: 5 },
  { name: 'Digital Electronics', shortName: 'DE', code: 'BEC-303', branch: 'Electronics Engineering', semester: 3, unitsCount: 5 },
  { name: 'Communication Systems', shortName: 'CS', code: 'BEC-401', branch: 'Electronics Engineering', semester: 4, unitsCount: 5 },
  { name: 'Microprocessor & Microcontroller', shortName: 'Micro', code: 'BEC-501', branch: 'Electronics Engineering', semester: 5, unitsCount: 5 },
  { name: 'VLSI Design', shortName: 'VLSI', code: 'BEC-601', branch: 'Electronics Engineering', semester: 6, unitsCount: 5 },

  // Electrical Engineering
  { name: 'Network Analysis & Synthesis', shortName: 'NAS', code: 'BEE-301', branch: 'Electrical Engineering', semester: 3, unitsCount: 5 },
  { name: 'Electrical Machines I', shortName: 'EM-1', code: 'BEE-302', branch: 'Electrical Engineering', semester: 3, unitsCount: 5 },
  { name: 'Power System I', shortName: 'PS-1', code: 'BEE-401', branch: 'Electrical Engineering', semester: 4, unitsCount: 5 },
  { name: 'Control Systems', shortName: 'CS', code: 'BEE-501', branch: 'Electrical Engineering', semester: 5, unitsCount: 5 },

  // Mechanical Engineering
  { name: 'Thermodynamics', shortName: 'Thermo', code: 'BME-301', branch: 'Mechanical Engineering', semester: 3, unitsCount: 5 },
  { name: 'Fluid Mechanics', shortName: 'FM', code: 'BME-302', branch: 'Mechanical Engineering', semester: 3, unitsCount: 5 },
  { name: 'Manufacturing Processes', shortName: 'MP', code: 'BME-401', branch: 'Mechanical Engineering', semester: 4, unitsCount: 5 },
  { name: 'Machine Design', shortName: 'MD', code: 'BME-501', branch: 'Mechanical Engineering', semester: 5, unitsCount: 5 },

  // Civil Engineering
  { name: 'Building Material & Construction', shortName: 'BMC', code: 'BCE-301', branch: 'Civil Engineering', semester: 3, unitsCount: 5 },
  { name: 'Surveying & Geomatics', shortName: 'Survey', code: 'BCE-302', branch: 'Civil Engineering', semester: 3, unitsCount: 5 },
  { name: 'Structural Analysis', shortName: 'SA', code: 'BCE-401', branch: 'Civil Engineering', semester: 4, unitsCount: 5 },
  { name: 'Geotechnical Engineering', shortName: 'GeoTech', code: 'BCE-501', branch: 'Civil Engineering', semester: 5, unitsCount: 5 },

  // Master of Computer Applications
  { name: 'Advanced Data Structures & Algorithms', shortName: 'ADSA', code: 'MCA-101', branch: 'Master of Computer Applications', semester: 1, unitsCount: 5 },
  { name: 'Relational Database Management Systems', shortName: 'RDBMS', code: 'MCA-102', branch: 'Master of Computer Applications', semester: 1, unitsCount: 5 },
  { name: 'Web Technology & Python Programming', shortName: 'Python-Web', code: 'MCA-201', branch: 'Master of Computer Applications', semester: 2, unitsCount: 5 },
  { name: 'Advanced Java Programming', shortName: 'Adv-Java', code: 'MCA-301', branch: 'Master of Computer Applications', semester: 3, unitsCount: 5 },
  { name: 'Software Project Management & Agile', shortName: 'SPM', code: 'MCA-401', branch: 'Master of Computer Applications', semester: 4, unitsCount: 5 }
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

    console.log(`[Seed Academic] ${knitSubjects.length} subjects seeded for KNIT Sultanpur successfully across all branches.`);
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
