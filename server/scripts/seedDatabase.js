require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../src/models/Department');
const Collection = require('../src/models/Collection');
const User = require('../src/models/User');
const Document = require('../src/models/Document');
const DocumentVersion = require('../src/models/DocumentVersion');
const FAQ = require('../src/models/FAQ');

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduquery_db';
    console.log(`Connecting to MongoDB for seeding: ${connStr}`);
    await mongoose.connect(connStr);

    console.log('Clearing existing collections...');
    await Department.deleteMany({});
    await Collection.deleteMany({});
    await User.deleteMany({});
    await Document.deleteMany({});
    await DocumentVersion.deleteMany({});
    await FAQ.deleteMany({});

    console.log('Seeding Departments...');
    const deptsData = [
      { name: 'Computer Science & Engineering', code: 'CSE', description: 'School of Computer Science and Software Engineering' },
      { name: 'Data Science & AI', code: 'DS', description: 'Department of Data Science, AI, and Machine Learning' },
      { name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics & Communication Engineering' },
      { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical & Robotics Engineering' },
      { name: 'Examination Cell', code: 'EXAM', description: 'Office of the Controller of Examinations' },
      { name: 'Student Affairs & Welfare', code: 'SA', description: 'Student Affairs, Hostels, and Extra-curricular Activities' },
    ];
    const createdDepts = await Department.insertMany(deptsData);
    const cseDept = createdDepts.find((d) => d.code === 'CSE');
    const examDept = createdDepts.find((d) => d.code === 'EXAM');

    console.log('Seeding Collections...');
    const collectionsData = [
      { name: 'General Academic Regulations', code: 'GEN-REG', departmentId: cseDept._id, description: 'General college policies and guidelines' },
      { name: 'CSE Department Regulations & Timetable', code: 'CSE-REG', departmentId: cseDept._id, description: 'CSE syllabus, timetable, and faculty list' },
      { name: 'Examination Guidelines & Schedule', code: 'EXAM-SCHED', departmentId: examDept._id, description: 'Exam rules, hall ticket info, and timetables' },
      { name: 'Student Handbook & Code of Conduct', code: 'SA-HANDBOOK', departmentId: createdDepts.find(d => d.code === 'SA')._id, description: 'Hostel rules, clubs, and sports' },
    ];
    const createdCollections = await Collection.insertMany(collectionsData);

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(12);

    const superAdminPassword = await bcrypt.hash('superadmin123', salt);
    const superAdmin = await User.create({
      name: 'Dr. Robert Vance (Super Admin)',
      email: 'superadmin@college.edu',
      password: superAdminPassword,
      role: 'super_admin',
    });

    const cseAdminPassword = await bcrypt.hash('deptadmin123', salt);
    const cseAdmin = await User.create({
      name: 'Prof. Alan Turing (CSE Admin)',
      email: 'cseadmin@college.edu',
      password: cseAdminPassword,
      role: 'dept_admin',
      departmentId: cseDept._id,
      accessibleCollectionIds: [createdCollections[0]._id, createdCollections[1]._id],
    });

    const studentPassword = await bcrypt.hash('student123', salt);
    const student = await User.create({
      name: 'Sarah Jenkins (Student)',
      email: 'student@college.edu',
      password: studentPassword,
      role: 'student',
      departmentId: cseDept._id,
      accessibleCollectionIds: createdCollections.map((c) => c._id),
    });

    console.log('Seeding Initial Document & Version 1...');
    const doc = await Document.create({
      title: 'Academic_Regulations_2026.pdf',
      filename: 'Academic_Regulations_2026.pdf',
      departmentId: cseDept._id,
      collectionId: createdCollections[0]._id,
      fileSize: 1048576,
      currentVersion: 1,
      status: 'processed',
      processingStep: 'ready',
      uploadedBy: cseAdmin._id,
      summary: {
        shortSummary: 'Official Academic Regulations 2026 detailing attendance criteria, grading schemes, and exam eligibility.',
        keyPoints: [
          'Minimum 75% attendance required in all subjects.',
          'Medical leave must be submitted within 3 working days.',
          'Internal assessments carry 40% weightage.',
          'End semester examinations carry 60% weightage.',
        ],
        importantDates: ['Mid-Term: Oct 15th', 'End-Semester: Dec 1st'],
        importantRules: ['75% Attendance mandatory', 'No smartphones in exam hall'],
        mainTopics: ['Attendance', 'Examinations', 'Grading', 'Promotions'],
      },
    });

    const mockChunks = [
      {
        chunkId: 'chunk-seed-1',
        text: 'ATTENDANCE REGULATIONS (Section 4.1): Students must maintain a minimum attendance of 75% in aggregate across all registered courses. Students falling below 75% without valid medical justification shall be detained from sitting the end semester examinations.',
        pageNumber: 4,
        keywords: ['attendance', 'regulations', '75%', 'detained', 'medical'],
        chunkIndex: 0,
      },
      {
        chunkId: 'chunk-seed-2',
        text: 'EXAMINATION & EVALUATION RULES (Section 6.2): Internal assessment carries 40% weightage comprising two mid-semester tests (20%), assignments (10%), and lab quizzes (10%). End semester examination carries 60% weightage.',
        pageNumber: 8,
        keywords: ['examination', 'evaluation', 'weightage', 'internal', 'mid-term'],
        chunkIndex: 1,
      },
      {
        chunkId: 'chunk-seed-3',
        text: 'FEE PAYMENT DEADLINES (Section 9.5): Tuition and hostel fees must be deposited on or before the 15th day of every semester quarter. Late fee penalty of $50 applies for payments delayed beyond the due date.',
        pageNumber: 14,
        keywords: ['fee', 'payment', 'deadline', '15th', 'penalty'],
        chunkIndex: 2,
      },
    ];

    const version = await DocumentVersion.create({
      documentId: doc._id,
      versionNumber: 1,
      filename: 'Academic_Regulations_2026.pdf',
      fileSize: 1048576,
      status: 'active',
      chunkCount: mockChunks.length,
      pageCount: 16,
      chunks: mockChunks,
      uploadedBy: cseAdmin._id,
    });

    doc.activeVersionId = version._id;
    await doc.save();

    console.log('Seeding Approved FAQs...');
    await FAQ.create([
      {
        question: 'What is the minimum attendance required to appear for exams?',
        answer: 'According to Section 4.1 of the Academic Regulations 2026, students must maintain a minimum of 75% attendance in aggregate across all registered courses.',
        departmentId: cseDept._id,
        collectionId: createdCollections[0]._id,
        documentId: doc._id,
        status: 'published',
        createdBy: cseAdmin._id,
      },
      {
        question: 'What is the weightage breakdown for internal marks?',
        answer: 'Internal assessment carries 40% weightage: Mid-term tests (20%), assignments (10%), and lab quizzes (10%). End-semester exam carries 60%.',
        departmentId: cseDept._id,
        collectionId: createdCollections[0]._id,
        documentId: doc._id,
        status: 'published',
        createdBy: cseAdmin._id,
      },
    ]);

    console.log('=======================================================');
    console.log('✅ Database seeded successfully!');
    console.log('Demo Credentials Created:');
    console.log('1. Super Admin: superadmin@college.edu / superadmin123');
    console.log('2. Dept Admin:  cseadmin@college.edu   / deptadmin123');
    console.log('3. Student:     student@college.edu    / student123');
    console.log('=======================================================');

    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
