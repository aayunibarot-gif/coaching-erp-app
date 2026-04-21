export const demoUsers = [
  {
    _id: "u1",
    studentId: "ADMIN01",
    name: "Admin User",
    email: "admin@erp.com",
    role: "admin",
    phone: "9876543210",
    parentName: "",
    parentPhone: "",
    classId: null,
    admissionDate: "2026-01-01",
  },
  {
    _id: "u2",
    studentId: "STU1001",
    name: "Riya Sharma",
    email: "riya@erp.com",
    role: "student",
    phone: "9123456780",
    parentName: "Sunita Sharma",
    parentPhone: "9871111111",
    classId: {
      _id: "c1",
      standardName: "6th Standard",
      batch: "Morning",
      batchName: "6th Standard - Morning"
    },
    admissionDate: "2026-01-10",
  },
  {
    _id: "u3",
    studentId: "STU1002",
    name: "Arjun Patel",
    email: "arjun@erp.com",
    role: "student",
    phone: "9234567810",
    parentName: "Mahesh Patel",
    parentPhone: "9872222222",
    classId: {
      _id: "c3",
      standardName: "8th Standard",
      batch: "Morning",
      batchName: "8th Standard - Morning"
    },
    admissionDate: "2026-01-12",
  },
  {
    _id: "u4",
    studentId: "FAC2001",
    name: "Meera Joshi",
    email: "teacher@erp.com",
    role: "teacher",
    phone: "9345678120",
    parentName: "",
    parentPhone: "",
    classId: null,
    admissionDate: "2026-01-05",
  },
  {
    _id: "u5",
    studentId: "STU1003",
    name: "Krish Mehta",
    email: "krish@erp.com",
    role: "student",
    phone: "9456781230",
    parentName: "Jignesh Mehta",
    parentPhone: "9873333333",
    classId: {
      _id: "c5",
      standardName: "10th Standard",
      batch: "Evening",
      batchName: "10th Standard - Evening"
    },
    admissionDate: "2026-01-15",
  },
  {
    _id: "u6",
    studentId: "STU1004",
    name: "Diya Joshi",
    email: "diya@erp.com",
    role: "student",
    phone: "9567812340",
    parentName: "Rupal Joshi",
    parentPhone: "9874444444",
    classId: {
      _id: "c2",
      standardName: "7th Standard",
      batch: "Morning",
      batchName: "7th Standard - Morning"
    },
    admissionDate: "2026-01-18",
  },
  {
    _id: "u7",
    studentId: "STU1005",
    name: "Yash Patel",
    email: "yash@erp.com",
    role: "student",
    phone: "9678123450",
    parentName: "Nilesh Patel",
    parentPhone: "9875555555",
    classId: {
      _id: "c4",
      standardName: "9th Standard",
      batch: "Evening",
      batchName: "9th Standard - Evening"
    },
    admissionDate: "2026-01-20",
  },
  {
    _id: "u8",
    studentId: "STU1006",
    name: "Anaya Shah",
    email: "anaya@erp.com",
    role: "student",
    phone: "9781234560",
    parentName: "Pooja Shah",
    parentPhone: "9876666666",
    classId: {
      _id: "c1",
      standardName: "6th Standard",
      batch: "Morning",
      batchName: "6th Standard - Morning"
    },
    admissionDate: "2026-01-22",
  },
  {
    _id: "u9",
    studentId: "STU1007",
    name: "Vivaan Desai",
    email: "vivaan@erp.com",
    role: "student",
    phone: "9892345670",
    parentName: "Kiran Desai",
    parentPhone: "9877777777",
    classId: {
      _id: "c3",
      standardName: "8th Standard",
      batch: "Morning",
      batchName: "8th Standard - Morning"
    },
    admissionDate: "2026-01-25",
  },
  {
    _id: "u10",
    studentId: "STU1008",
    name: "Aarya Trivedi",
    email: "aarya@erp.com",
    role: "student",
    phone: "9811111111",
    parentName: "Mitesh Trivedi",
    parentPhone: "9878888888",
    classId: {
      _id: "c6",
      standardName: "6th Standard",
      batch: "Evening",
      batchName: "6th Standard - Evening"
    },
    admissionDate: "2026-01-26",
  },
  {
    _id: "u11",
    studentId: "STU1009",
    name: "Dev Rajput",
    email: "dev@erp.com",
    role: "student",
    phone: "9822222222",
    parentName: "Alpesh Rajput",
    parentPhone: "9879999999",
    classId: {
      _id: "c7",
      standardName: "7th Standard",
      batch: "Evening",
      batchName: "7th Standard - Evening"
    },
    admissionDate: "2026-01-27",
  }
];

export const demoClasses = [
  {
    _id: "c1",
    standardName: "6th Standard",
    batch: "Morning",
    batchName: "6th Standard - Morning",
    timingStart: "08:00 AM",
    timingEnd: "09:00 AM"
  },
  {
    _id: "c6",
    standardName: "6th Standard",
    batch: "Evening",
    batchName: "6th Standard - Evening",
    timingStart: "04:00 PM",
    timingEnd: "05:00 PM"
  },
  {
    _id: "c2",
    standardName: "7th Standard",
    batch: "Morning",
    batchName: "7th Standard - Morning",
    timingStart: "09:00 AM",
    timingEnd: "10:00 AM"
  },
  {
    _id: "c7",
    standardName: "7th Standard",
    batch: "Evening",
    batchName: "7th Standard - Evening",
    timingStart: "05:00 PM",
    timingEnd: "06:00 PM"
  },
  {
    _id: "c3",
    standardName: "8th Standard",
    batch: "Morning",
    batchName: "8th Standard - Morning",
    timingStart: "10:00 AM",
    timingEnd: "11:00 AM"
  },
  {
    _id: "c4",
    standardName: "9th Standard",
    batch: "Evening",
    batchName: "9th Standard - Evening",
    timingStart: "04:00 PM",
    timingEnd: "05:00 PM"
  },
  {
    _id: "c5",
    standardName: "10th Standard",
    batch: "Evening",
    batchName: "10th Standard - Evening",
    timingStart: "05:00 PM",
    timingEnd: "06:00 PM"
  }
];

export const demoSubjects = [
  { _id: "s1", classId: demoClasses[0], subjectName: "Mathematics", teacherId: { _id: "u4", name: "Meera Joshi" } },
  { _id: "s2", classId: demoClasses[4], subjectName: "Science", teacherId: { _id: "u4", name: "Meera Joshi" } },
  { _id: "s3", classId: demoClasses[6], subjectName: "English", teacherId: { _id: "u4", name: "Meera Joshi" } },
  { _id: "s4", classId: demoClasses[5], subjectName: "Mathematics", teacherId: { _id: "u4", name: "Meera Joshi" } },
  { _id: "s5", classId: demoClasses[2], subjectName: "Science", teacherId: { _id: "u4", name: "Meera Joshi" } }
];

export const demoFees = [
  {
    _id: "f1",
    studentId: { _id: "u2", name: "Riya Sharma", studentId: "STU1001", parentName: "Sunita Sharma", parentPhone: "9871111111" },
    classId: demoClasses[0],
    totalAmount: 1500,
    paidAmount: 1000,
    pendingAmount: 500,
    dueDate: "2026-05-10",
    status: "partial",
  },
  {
    _id: "f2",
    studentId: { _id: "u3", name: "Arjun Patel", studentId: "STU1002", parentName: "Mahesh Patel", parentPhone: "9872222222" },
    classId: demoClasses[4],
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    dueDate: "2026-05-10",
    status: "paid",
  },
  {
    _id: "f3",
    studentId: { _id: "u5", name: "Krish Mehta", studentId: "STU1003", parentName: "Jignesh Mehta", parentPhone: "9873333333" },
    classId: demoClasses[6],
    totalAmount: 3000,
    paidAmount: 1500,
    pendingAmount: 1500,
    dueDate: "2026-05-18",
    status: "partial",
  }
];

export const demoMarks = [
  {
    _id: "m1",
    studentId: { _id: "u2", name: "Riya Sharma" },
    subjectId: { _id: "s1", subjectName: "Mathematics" },
    testType: "Unit Test",
    obtainedMarks: 82,
    maxMarks: 100,
    examDate: "2026-04-12",
  },
  {
    _id: "m2",
    studentId: { _id: "u3", name: "Arjun Patel" },
    subjectId: { _id: "s2", subjectName: "Science" },
    testType: "Weekly Test",
    obtainedMarks: 91,
    maxMarks: 100,
    examDate: "2026-04-13",
  },
  {
    _id: "m3",
    studentId: { _id: "u5", name: "Krish Mehta" },
    subjectId: { _id: "s3", subjectName: "English" },
    testType: "Grand Test",
    obtainedMarks: 88,
    maxMarks: 100,
    examDate: "2026-04-14",
  }
];

export const demoAttendanceRecords = [
  { _id: "a1", studentId: { _id: "u2", name: "Riya Sharma", studentId: "STU1001" }, classId: "c1", date: "2026-04-10", status: "present" },
  { _id: "a2", studentId: { _id: "u2", name: "Riya Sharma", studentId: "STU1001" }, classId: "c1", date: "2026-04-11", status: "absent" },
  { _id: "a3", studentId: { _id: "u3", name: "Arjun Patel", studentId: "STU1002" }, classId: "c3", date: "2026-04-10", status: "present" },
  { _id: "a4", studentId: { _id: "u3", name: "Arjun Patel", studentId: "STU1002" }, classId: "c3", date: "2026-04-11", status: "present" },
  { _id: "a5", studentId: { _id: "u5", name: "Krish Mehta", studentId: "STU1003" }, classId: "c5", date: "2026-04-10", status: "present" },
  { _id: "a6", studentId: { _id: "u5", name: "Krish Mehta", studentId: "STU1003" }, classId: "c5", date: "2026-04-11", status: "present" },
  { _id: "a7", studentId: { _id: "u6", name: "Diya Joshi", studentId: "STU1004" }, classId: "c2", date: "2026-04-10", status: "absent" },
  { _id: "a8", studentId: { _id: "u7", name: "Yash Patel", studentId: "STU1005" }, classId: "c4", date: "2026-04-10", status: "present" },
  { _id: "a9", studentId: { _id: "u8", name: "Anaya Shah", studentId: "STU1006" }, classId: "c1", date: "2026-04-10", status: "present" },
  { _id: "a10", studentId: { _id: "u10", name: "Aarya Trivedi", studentId: "STU1008" }, classId: "c6", date: "2026-04-10", status: "present" },
  { _id: "a11", studentId: { _id: "u11", name: "Dev Rajput", studentId: "STU1009" }, classId: "c7", date: "2026-04-10", status: "absent" }
];

export const demoTimetable = [
  { _id: "t1", day: "Monday", standard: "6th Standard", subject: "Mathematics", time: "08:00 AM - 09:00 AM" },
  { _id: "t2", day: "Tuesday", standard: "8th Standard", subject: "Science", time: "10:00 AM - 11:00 AM" },
  { _id: "t3", day: "Wednesday", standard: "10th Standard", subject: "English", time: "05:00 PM - 06:00 PM" }
];

export const demoNotices = [
  { _id: "n1", title: "Holiday Notice", message: "Tuition will remain closed on Sunday.", createdAt: "2026-04-15" },
  { _id: "n2", title: "Test Announcement", message: "Weekly test for 8th Standard on Friday.", createdAt: "2026-04-16" },
  { _id: "n3", title: "Fee Reminder", message: "Parents are requested to clear pending fees before 20th April.", createdAt: "2026-04-17" }
];
