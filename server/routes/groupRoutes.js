import express from "express";
import multer from "multer";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addMember,
  updateMember,
  deleteMember,
  deleteMembers,
  parseExcelFile,
  importMembersFromExcel,
} from "../controllers/groupController.js";

const router = express.Router();

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed."));
    }
  },
});

// All routes require authentication
router.use(requireAuth);

// Group CRUD operations
router.get("/", requirePermission("communication", "view"), getAllGroups);
router.get("/:id", requirePermission("communication", "view"), getGroupById);
router.post("/", requirePermission("communication", "create"), createGroup);
router.put("/:id", requirePermission("communication", "edit"), updateGroup);
router.delete("/:id", requirePermission("communication", "delete"), deleteGroup);

// Member operations
router.get("/:id/members", requirePermission("communication", "view"), getGroupMembers);
router.post("/:id/members", requirePermission("communication", "edit"), addMember);
router.put("/:id/members/:memberId", requirePermission("communication", "edit"), updateMember);
router.delete("/:id/members/:memberId", requirePermission("communication", "edit"), deleteMember);
router.post("/:id/members/delete", requirePermission("communication", "edit"), deleteMembers);

// Excel import operations
router.post("/parse-excel", requirePermission("communication", "edit"), upload.single("file"), parseExcelFile);
router.post("/:id/import-excel", requirePermission("communication", "edit"), upload.single("file"), importMembersFromExcel);

export default router;

