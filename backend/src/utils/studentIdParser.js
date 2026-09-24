/**
 * Utility to parse student credentials from official KNIT college emails
 * Format: name.rollno@knit.ac.in (e.g., mukul.24636@knit.ac.in)
 * Also handles multi-part names: first.last.rollno@knit.ac.in, first_last.rollno@knit.ac.in
 */

const parseCollegeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      name: '',
      studentId: '',
      rollNumber: '',
      isValidCollegeEmail: false
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const [localPart, domain] = cleanEmail.split('@');

  if (!localPart) {
    return {
      name: '',
      studentId: '',
      rollNumber: '',
      isValidCollegeEmail: false
    };
  }

  // Regex to extract trailing roll number digits (4 to 10 digits)
  // e.g. mukul.24636 -> name part: "mukul", roll: "24636"
  // e.g. shreya.singh.22415 -> name part: "shreya.singh", roll: "22415"
  // e.g. aditya_kumar.21512 -> name part: "aditya_kumar", roll: "21512"
  // e.g. 24636 -> roll: "24636"
  const matchWithRoll = localPart.match(/^(.*?)(?:[._-]*)?(\d{4,10})$/);

  let rawName = '';
  let rollNumber = '';

  if (matchWithRoll) {
    rawName = matchWithRoll[1];
    rollNumber = matchWithRoll[2];
  } else {
    rawName = localPart;
  }

  // Strip leading and trailing punctuation
  rawName = rawName.replace(/^[._-]+|[._-]+$/g, '');

  // Split name parts and capitalize each token
  const words = rawName.split(/[._\-\s]+/).filter(Boolean);
  let formattedName = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // If no name found (e.g. only roll number was provided), give a clean identifier
  if (!formattedName) {
    if (rollNumber) {
      formattedName = `Student ${rollNumber}`;
    } else {
      formattedName = 'KNIT Student';
    }
  }

  return {
    name: formattedName,
    studentId: rollNumber || '',
    rollNumber: rollNumber || '',
    isValidCollegeEmail: domain === 'knit.ac.in'
  };
};

module.exports = {
  parseCollegeEmail
};
