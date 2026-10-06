const mongoose = require("mongoose");
const Visitor = require("../models/Visitor");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatError = (error) => {
  if (error?.name === "ValidationError") {
    return Object.values(error.errors).map((item) => item.message).join(" | ");
  }
  return error?.message || "Unknown error";
};

const getVisitors = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const safeSearch = escapeRegex(search);
    const filter = search
      ? {
          $or: [
            { visitorName: { $regex: safeSearch, $options: "i" } },
            { mobileNumber: { $regex: safeSearch, $options: "i" } }
          ]
        }
      : {};

    const visitors = await Visitor.find(filter).sort({ visitDateTime: -1 });
    res.json(visitors);
  } catch (error) {
    console.error("GET VISITORS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch visitors", error: formatError(error) });
  }
};

const getVisitorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid visitor ID" });
    }

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch visitor", error: error.message });
  }
};

const createVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create visitor",
      error: error.message
    });
  }
};

const updateVisitor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid visitor ID" });
    }

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update visitor",
      error: error.message
    });
  }
};

const deleteVisitor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid visitor ID" });
    }

    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete visitor",
      error: error.message
    });
  }
};

module.exports = {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor
};
