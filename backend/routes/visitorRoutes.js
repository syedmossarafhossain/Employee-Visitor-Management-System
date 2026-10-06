const express = require("express");
const {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor
} = require("../controllers/visitorController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getVisitors);
router.get("/:id", getVisitorById);
router.post("/", adminOnly, createVisitor);
router.put("/:id", adminOnly, updateVisitor);
router.delete("/:id", adminOnly, deleteVisitor);

module.exports = router;
