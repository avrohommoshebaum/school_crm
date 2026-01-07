/**
 * Principal Routes
 * Handles principal center operations
 */

import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getMyGrades,
  getGradeClasses,
  getClassStudents,
  getStudent,
  getClassOverviews,
  createClassOverview,
  updateClassOverview,
  deleteClassOverview,
  getStudentOverviews,
  createStudentOverview,
  updateStudentOverview,
  deleteStudentOverview,
  getGradeOverviews,
  createGradeOverview,
  updateGradeOverview,
  deleteGradeOverview,
} from "../controllers/principalController.js";

const router = express.Router();

// All routes require authentication and principalCenter.view permission
router.use(requireAuth);
router.use(requirePermission("principalCenter", "view"));

// Get principal's assigned grades
router.get("/grades", getMyGrades);

// Get classes for a grade
router.get("/grades/:gradeId/classes", getGradeClasses);

// Get students for a class
router.get("/classes/:classId/students", getClassStudents);

// Get student details
router.get("/students/:studentId", getStudent);

// Class overviews
router.get("/classes/:classId/overviews", getClassOverviews);
router.post("/classes/:classId/overviews", createClassOverview);
router.put("/overviews/class/:overviewId", updateClassOverview);
router.delete("/overviews/class/:overviewId", deleteClassOverview);

// Student overviews
router.get("/students/:studentId/overviews", getStudentOverviews);
router.post("/students/:studentId/overviews", createStudentOverview);
router.put("/overviews/student/:overviewId", updateStudentOverview);
router.delete("/overviews/student/:overviewId", deleteStudentOverview);

// Grade overviews
router.get("/grades/:gradeId/overviews", getGradeOverviews);
router.post("/grades/:gradeId/overviews", createGradeOverview);
router.put("/overviews/grade/:overviewId", updateGradeOverview);
router.delete("/overviews/grade/:overviewId", deleteGradeOverview);

export default router;

