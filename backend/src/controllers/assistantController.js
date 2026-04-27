import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Mark from "../models/Mark.js";
import Fee from "../models/Fee.js";
import Timetable from "../models/Timetable.js";
import ClassModel from "../models/Class.js";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function instituteAssistant(req, res) {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: "query is required." });
  }

  try {
    const role = req.user.role;
    const studentId = role === "parent" ? req.user.linkedStudentId : req.user._id;

    // 1. Fetch all relevant context for the student
    const [student, attendance, marks, fees, timetableData] = await Promise.all([
      User.findById(studentId).populate("classId"),
      Attendance.find({ studentId }),
      Mark.find({ studentId }).populate("subjectId", "subjectName"),
      Fee.findOne({ studentId }).sort({ createdAt: -1 }),
      Timetable.find({ classId: req.user.classId })
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // 2. Prepare data summary for Gemini context
    const contextData = {
      studentName: student.name,
      class: student.classId ? `${student.classId.standardName} - ${student.classId.batchName || student.classId.batch}` : "Not assigned",
      attendance: {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        percentage: attendance.length > 0 ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(2) + "%" : "No records"
      },
      academicPerformance: marks.map(m => ({
        subject: m.subjectId?.subjectName || "Unknown",
        marks: `${m.obtainedMarks}/${m.maxMarks}`,
        date: m.examDate || "N/A"
      })),
      feeStatus: fees ? {
        status: fees.status,
        pendingAmount: fees.pendingAmount,
        totalAmount: fees.totalAmount
      } : "No fee records found",
      timetable: timetableData.map(t => ({
        day: t.day,
        subject: t.subject,
        time: t.time
      }))
    };


    // 3. Initialize Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are the AI Assistant for "Coaching Institute ERP". 
      Your goal is to help students and parents by providing information about their own data.
      
      RULES:
      1. ONLY answer based on the provided student context.
      2. If you don't have information about something in the context, politely say you don't have that data yet.
      3. Use a helpful, encouraging, and professional tone.
      4. DO NOT answer general questions unrelated to the coaching institute or the student's data.
      5. Format your response in clean Markdown. Use bullet points and bold text for readability.
      6. If the query is just a greeting, welcome them and mention you can help with their attendance, marks, fees, and timetable.
      
      CONTEXT:
      ${JSON.stringify(contextData, null, 2)}`
    });

    // 4. Generate response
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();

    return res.json({ text });

  } catch (error) {
    console.error("Assistant Error:", error);
    return res.status(500).json({ message: "AI Assistant is currently unavailable. Please try again later." });
  }
}

