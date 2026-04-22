import Material from "../models/Material.js";
import fs from "fs";
import path from "path";

// Get all materials for a specific class
export const getMaterialsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const materials = await Material.find({ classId })
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials", error: error.message });
  }
};

// Get all materials (for admin/general)
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate("classId", "standardName batchName")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials", error: error.message });
  }
};

// Create new material record (file is handled by multer middleware)
export const uploadMaterial = async (req, res) => {
  try {
    const { title, classId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const material = await Material.create({
      title,
      classId,
      teacherId: req.user._id,
      pdfPath: `/uploads/${req.file.filename}`,
    });

    const populated = await Material.findById(material._id)
      .populate("teacherId", "name")
      .populate("classId", "standardName batchName");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error uploading material", error: error.message });
  }
};

// Delete material
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Optional: Check if the user is the teacher who uploaded it or an admin
    if (req.user.role !== "admin" && material.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this material" });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), material.pdfPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await material.deleteOne();
    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting material", error: error.message });
  }
};
