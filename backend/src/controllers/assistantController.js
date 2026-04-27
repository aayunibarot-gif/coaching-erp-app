import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Mark from "../models/Mark.js";
import Fee from "../models/Fee.js";
import Timetable from "../models/Timetable.js";
import ClassModel from "../models/Class.js";
import dotenv from "dotenv";

dotenv.config();



export async function instituteAssistant(req, res) {
  const { query } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("[Assistant] CRITICAL: GEMINI_API_KEY is missing from environment variables.");
    return res.status(500).json({ 
      message: "AI Assistant configuration is missing. Please ensure GEMINI_API_KEY is set in the environment." 
    });
  }

  if (!query) {
    return res.status(400).json({ message: "query is required." });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const role = req.user.role;
    const studentId = role === "parent" ? req.user.linkedStudentId : req.user._id;

    console.log(`[Assistant] Query from ${req.user.email} (Role: ${role}) for student ${studentId}`);

    // 1. Fetch all relevant context for the student
    const student = await User.findById(studentId).populate("classId");
    
    if (!student) {
      console.error("[Assistant] Student not found for ID:", studentId);
      return res.status(404).json({ message: "Student not found." });
    }

    const [attendance, marks, fees, timetableData] = await Promise.all([
      Attendance.find({ studentId }),
      Mark.find({ studentId }).populate("subjectId", "subjectName"),
      Fee.findOne({ studentId }).sort({ createdAt: -1 }),
      Timetable.find({ classId: student.classId?._id || student.classId })
    ]);

    // 2. Prepare data summary for Gemini context
    const contextData = {
      studentName: student.name,
      class: student.classId ? `${student.classId.standardName} - ${student.classId.batchName}` : "Not assigned",
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
      timetable: (timetableData || []).map(t => ({
        day: t.day,
        subject: t.subject,
        time: t.time
      }))
    };

    console.log("[Assistant] Context prepared. Calling Gemini...");

    // 3. Initialize Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are the AI Assistant for "Eduverse Coaching Institute". 
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

    // 4. Generate response with safety catch
    try {
      const result = await model.generateContent(query);
      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error("Empty response from AI");
      
      console.log("[Assistant] Success.");
      return res.json({ text });
    } catch (aiErr) {
      console.error("[Assistant] Gemini Error:", aiErr);
      return res.status(500).json({ message: "The AI is having trouble processing your data. Please try again." });
    }

  } catch (error) {
    console.error("[Assistant] Internal Error:", error);
    return res.status(500).json({ message: "AI Assistant is currently unavailable. Please try again later." });
  }
}


