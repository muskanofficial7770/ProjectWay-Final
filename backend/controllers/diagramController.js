// controllers/diagramController.js
import Diagram from "../models/Diagram.js";

// POST: create or update diagram
export const saveDiagram = async (req, res) => {
  try {
    console.log(" Saving diagram with data:", req.body);

    const {
      studentId,
      projectId,
      diagramData,
      title,
      description,
      shapes,
    } = req.body;

    // Support both old format (studentId, projectId) and new format
    let query = {};
    if (studentId && projectId) {
      query = { studentId, projectId };
    } else if (title) {
      query = { title };
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Either (studentId and projectId) or title is required",
      });
    }

    let diagram = await Diagram.findOne(query);

    if (diagram) {
      // Update existing diagram - ensure it belongs to the requesting user
      if (diagram.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own diagrams",
        });
      }
      if (diagramData) diagram.diagramData = diagramData;
      if (shapes) diagram.shapes = shapes;
      if (description) diagram.description = description;
      diagram.updatedAt = new Date();
      await diagram.save();
      console.log(" Diagram updated:", diagram._id);
    } else {
      // Create new diagram
      diagram = await Diagram.create({
        studentId,
        projectId,
        diagramData,
        title: title || "Untitled Diagram",
        description: description || "",
        shapes: shapes || [],
        createdBy: studentId, // Use studentId as createdBy for per-user tracking
      });
      console.log(" Diagram created:", diagram._id);
    }

    res.status(200).json({
      success: true,
      message: "Diagram saved successfully",
      data: diagram,
    });
  } catch (err) {
    console.error(" Error saving diagram:", err);
    res.status(500).json({
      success: false,
      message: "Server error saving diagram",
      error: err.message,
    });
  }
};

// GET: get one diagram
export const getDiagram = async (req, res) => {
  try {
    console.log(" Fetching diagram with params:", req.params);

    const { studentId, projectId, id } = req.params;

    let diagram;
    if (id) {
      diagram = await Diagram.findById(id);
    } else if (studentId && projectId) {
      diagram = await Diagram.findOne({ studentId, projectId });
    } else {
      return res.status(400).json({
        success: false,
        message: "Either id or (studentId and projectId) is required",
      });
    }

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found",
      });
    }

    console.log(" Diagram found:", diagram._id);
    res.status(200).json({
      success: true,
      message: "Diagram retrieved successfully",
      data: diagram,
    });
  } catch (err) {
    console.error(" Error fetching diagram:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching diagram",
      error: err.message,
    });
  }
};

// GET: get all diagrams for a specific user
export const getAllDiagrams = async (req, res) => {
  try {
    console.log(" Fetching all diagrams...");

    const { studentId } = req.query;
    
    let diagrams;
    if (studentId) {
      // Only return diagrams for the specific user
      diagrams = await Diagram.find({ studentId }).sort({ createdAt: -1 });
    } else {
      // If no studentId provided, return all (legacy behavior)
      diagrams = await Diagram.find().sort({ createdAt: -1 });
    }

    console.log(` Found ${diagrams.length} diagrams`);

    res.status(200).json({
      success: true,
      message: "Diagrams retrieved successfully",
      data: diagrams,
    });
  } catch (err) {
    console.error(" Error fetching diagrams:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching diagrams",
      error: err.message,
    });
  }
};

// PUT: update diagram
export const updateDiagram = async (req, res) => {
  try {
    console.log(" Updating diagram with ID:", req.params.id);

    const { id } = req.params;
    const updates = req.body;

    const diagram = await Diagram.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found",
      });
    }

    console.log(" Diagram updated:", diagram._id);
    res.status(200).json({
      success: true,
      message: "Diagram updated successfully",
      data: diagram,
    });
  } catch (err) {
    console.error(" Error updating diagram:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating diagram",
      error: err.message,
    });
  }
};

