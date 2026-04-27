import Mark from "../models/Mark.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";

export const getStudentResult = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).populate("classId");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const marks = await Mark.find({ studentId }).populate("subjectId");

    // Group marks by testType
    const reportCards = {};

    marks.forEach((mark) => {
      const type = mark.testType || "Unit Test";
      if (!reportCards[type]) {
        reportCards[type] = {
          testType: type,
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
        };
      }

      reportCards[type].subjects.push({
        subjectName: mark.subjectId?.subjectName || "Unknown",
        obtained: mark.obtainedMarks,
        max: mark.maxMarks,
        date: mark.examDate,
      });

      reportCards[type].totalObtained += mark.obtainedMarks;
      reportCards[type].totalMax += mark.maxMarks;
    });

    // Convert to array and calculate percentage
    const consolidated = Object.values(reportCards).map((card) => ({
      ...card,
      percentage: card.totalMax > 0 ? ((card.totalObtained / card.totalMax) * 100).toFixed(2) : 0,
      status: (card.totalObtained / card.totalMax) * 100 >= 40 ? "Pass" : "Fail",
    }));

    res.json({
      student: {
        name: student.name,
        studentId: student.studentId,
        standard: student.classId?.standardName,
        batch: student.classId?.batchName || student.classId?.batch,
      },
      results: consolidated,
    });
  } catch (error) {
    console.error("Result fetch error:", error);
    res.status(500).json({ message: "Server error fetching results" });
  }
};
