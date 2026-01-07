/**
 * Principal Controller
 * Handles principal center operations: viewing grades, classes, students, and managing overviews
 */

import { staffService } from "../db/services/staffService.js";
import { gradeService } from "../db/services/gradeService.js";
import { classService } from "../db/services/classService.js";
import { studentService } from "../db/services/studentService.js";
import {
  principalGradeAssignmentService,
  classOverviewService,
  studentOverviewService,
  gradeOverviewService,
} from "../db/services/principalCenterService.js";
import { can } from "../helpers/can.js";

// Helper to get or create staff record for user
const getOrCreateStaff = async (userId, user) => {
  let staff = await staffService.findByUserId(userId);
  if (!staff) {
    // Auto-create staff record from user data
    const nameParts = (user.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    staff = await staffService.create({
      userId,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      employmentStatus: "active",
    });
  }
  return staff;
};

// Get principal's assigned grades
export const getMyGrades = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // Admin users can access all grades
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (isAdmin) {
      // Admin: return all grades
      const allGrades = await gradeService.findAll();
      allGrades.sort((a, b) => (a.level || 0) - (b.level || 0));
      return res.json({ grades: allGrades, assignments: [] });
    }
    
    // Get or create staff record for this user
    const staff = await getOrCreateStaff(userId, req.user);

    // Check if user is a principal
    const isPrincipal = await staffService.isPrincipal(staff.id);
    if (!isPrincipal) {
      return res.status(403).json({ message: "Access denied. Principal access required." });
    }

    // Get assigned grades
    const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
    const gradeIds = assignments.map(a => a.gradeId);
    
    // Get full grade details
    const grades = [];
    for (const gradeId of gradeIds) {
      const grade = await gradeService.findById(gradeId);
      if (grade) {
        grades.push(grade);
      }
    }

    // Sort by level
    grades.sort((a, b) => (a.level || 0) - (b.level || 0));

    res.json({ grades, assignments });
  } catch (error) {
    console.error("Error getting principal grades:", error);
    res.status(500).json({ message: "Error fetching grades", error: error.message });
  }
};

// Get classes for a grade
export const getGradeClasses = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { gradeId } = req.params;

    // Admin users can access all grades
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      // Get or create staff record
      const staff = await getOrCreateStaff(userId, req.user);

      const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
      const hasAccess = assignments.some(a => a.gradeId === gradeId && a.isActive);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this grade" });
      }
    }

    // Get classes for this grade
    const classes = await classService.findAll({ gradeId, status: 'active' });
    
    // Get student count for each class
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await classService.getStudentCount(cls.id);
        const teachers = await classService.getTeachers(cls.id);
        return {
          ...cls,
          studentCount,
          teachers: teachers.map(t => ({
            id: t.id,
            firstName: t.first_name,
            lastName: t.last_name,
            role: t.role,
          })),
        };
      })
    );

    res.json({ classes: classesWithCounts });
  } catch (error) {
    console.error("Error getting grade classes:", error);
    res.status(500).json({ message: "Error fetching classes", error: error.message });
  }
};

// Get students for a class
export const getClassStudents = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { classId } = req.params;

    // Get class and verify access
    const classRecord = await classService.findById(classId);
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Admin users can access all classes
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      // Get or create staff record
      const staff = await getOrCreateStaff(userId, req.user);

      if (classRecord.gradeId) {
        const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
        const hasAccess = assignments.some(a => a.gradeId === classRecord.gradeId && a.isActive);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this class" });
        }
      }
    }

    // Get students
    const students = await studentService.findByClassId(classId);

    res.json({ students, class: classRecord });
  } catch (error) {
    console.error("Error getting class students:", error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Get student details
export const getStudent = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { studentId } = req.params;

    // Get student
    const student = await studentService.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Admin users can access all students
    const isAdmin = can(req.user, "principalCenter", "view");
    
    // Verify principal has access (through grade) - skip for admins
    if (!isAdmin && student.gradeId) {
      const staff = await getOrCreateStaff(userId, req.user);

      const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
      const hasAccess = assignments.some(a => a.gradeId === student.gradeId && a.isActive);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this student" });
      }
    }

    res.json({ student });
  } catch (error) {
    console.error("Error getting student:", error);
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// ============================================
// CLASS OVERVIEWS
// ============================================

export const getClassOverviews = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { classId } = req.params;
    const { limit, offset } = req.query;

    // Verify access
    const classRecord = await classService.findById(classId);
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (classRecord.gradeId) {
        const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
        const hasAccess = assignments.some(a => a.gradeId === classRecord.gradeId && a.isActive);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }

    const overviews = await classOverviewService.findByClassId(classId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    res.json({ overviews });
  } catch (error) {
    console.error("Error getting class overviews:", error);
    res.status(500).json({ message: "Error fetching overviews", error: error.message });
  }
};

export const createClassOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { classId } = req.params;
    const {
      overviewDate,
      hebrewNotes,
      englishNotes,
      overallSummary,
      behaviorTrends,
      academicTrends,
      concerns,
      positives,
    } = req.body;

    // Verify access
    const classRecord = await classService.findById(classId);
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (classRecord.gradeId) {
        const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
        const hasAccess = assignments.some(a => a.gradeId === classRecord.gradeId && a.isActive);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }
    
    // Get or create staff record for principalId (needed for overview creation)
    const staff = await getOrCreateStaff(userId, req.user);

    const overview = await classOverviewService.create({
      classId,
      principalId: staff.id,
      overviewDate: overviewDate || new Date(),
      hebrewNotes,
      englishNotes,
      overallSummary,
      behaviorTrends,
      academicTrends,
      concerns,
      positives,
      createdBy: userId,
    });

    res.status(201).json({ message: "Class overview created", overview });
  } catch (error) {
    console.error("Error creating class overview:", error);
    res.status(500).json({ message: "Error creating overview", error: error.message });
  }
};

export const updateClassOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overviewId } = req.params;
    const updates = req.body;

    // Verify ownership/access
    const overview = await classOverviewService.findById(overviewId);
    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (overview.principalId !== staff.id && overview.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const updated = await classOverviewService.update(overviewId, updates);
    res.json({ message: "Overview updated", overview: updated });
  } catch (error) {
    console.error("Error updating class overview:", error);
    res.status(500).json({ message: "Error updating overview", error: error.message });
  }
};

export const deleteClassOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overviewId } = req.params;

    const overview = await classOverviewService.findById(overviewId);
    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (overview.principalId !== staff.id && overview.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await classOverviewService.delete(overviewId);
    res.json({ message: "Overview deleted" });
  } catch (error) {
    console.error("Error deleting class overview:", error);
    res.status(500).json({ message: "Error deleting overview", error: error.message });
  }
};

// ============================================
// STUDENT OVERVIEWS
// ============================================

export const getStudentOverviews = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { studentId } = req.params;
    const { limit, offset } = req.query;

    // Verify access
    const student = await studentService.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (student.gradeId) {
        const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
        const hasAccess = assignments.some(a => a.gradeId === student.gradeId && a.isActive);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }

    const overviews = await studentOverviewService.findByStudentId(studentId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    res.json({ overviews });
  } catch (error) {
    console.error("Error getting student overviews:", error);
    res.status(500).json({ message: "Error fetching overviews", error: error.message });
  }
};

export const createStudentOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { studentId } = req.params;
    const {
      overviewDate,
      hebrewNotes,
      englishNotes,
      behaviorNotes,
      academicNotes,
      socialNotes,
      concerns,
      positives,
      followUpRequired,
      followUpNotes,
    } = req.body;

    // Verify access
    const student = await studentService.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (student.gradeId) {
        const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
        const hasAccess = assignments.some(a => a.gradeId === student.gradeId && a.isActive);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }
    
    // Get or create staff record for principalId (needed for overview creation)
    const staff = await getOrCreateStaff(userId, req.user);

    const overview = await studentOverviewService.create({
      studentId,
      principalId: staff.id,
      overviewDate: overviewDate || new Date(),
      hebrewNotes,
      englishNotes,
      behaviorNotes,
      academicNotes,
      socialNotes,
      concerns,
      positives,
      followUpRequired: followUpRequired || false,
      followUpNotes,
      createdBy: userId,
    });

    res.status(201).json({ message: "Student overview created", overview });
  } catch (error) {
    console.error("Error creating student overview:", error);
    res.status(500).json({ message: "Error creating overview", error: error.message });
  }
};

export const updateStudentOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overviewId } = req.params;
    const updates = req.body;

    const overview = await studentOverviewService.findById(overviewId);
    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (overview.principalId !== staff.id && overview.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const updated = await studentOverviewService.update(overviewId, updates);
    res.json({ message: "Overview updated", overview: updated });
  } catch (error) {
    console.error("Error updating student overview:", error);
    res.status(500).json({ message: "Error updating overview", error: error.message });
  }
};

export const deleteStudentOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overviewId } = req.params;

    const overview = await studentOverviewService.findById(overviewId);
    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (overview.principalId !== staff.id && overview.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await studentOverviewService.delete(overviewId);
    res.json({ message: "Overview deleted" });
  } catch (error) {
    console.error("Error deleting student overview:", error);
    res.status(500).json({ message: "Error deleting overview", error: error.message });
  }
};

// ============================================
// GRADE OVERVIEWS
// ============================================

export const getGradeOverviews = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { gradeId } = req.params;
    const { limit, offset } = req.query;

    // Verify access
    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
      const hasAccess = assignments.some(a => a.gradeId === gradeId && a.isActive);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const overviews = await gradeOverviewService.findByGradeId(gradeId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    res.json({ overviews });
  } catch (error) {
    console.error("Error getting grade overviews:", error);
    res.status(500).json({ message: "Error fetching overviews", error: error.message });
  }
};

export const createGradeOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { gradeId } = req.params;
    const {
      overviewDate,
      hebrewNotes,
      englishNotes,
      overallSummary,
      behaviorTrends,
      academicTrends,
      concerns,
      positives,
    } = req.body;

    // Verify access
    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      const assignments = await principalGradeAssignmentService.findByPrincipalId(staff.id);
      const hasAccess = assignments.some(a => a.gradeId === gradeId && a.isActive);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    // Get or create staff record for principalId (needed for overview creation)
    const staff = await getOrCreateStaff(userId, req.user);

    const overview = await gradeOverviewService.create({
      gradeId,
      principalId: staff.id,
      overviewDate: overviewDate || new Date(),
      hebrewNotes,
      englishNotes,
      overallSummary,
      behaviorTrends,
      academicTrends,
      concerns,
      positives,
      createdBy: userId,
    });

    res.status(201).json({ message: "Grade overview created", overview });
  } catch (error) {
    console.error("Error creating grade overview:", error);
    res.status(500).json({ message: "Error creating overview", error: error.message });
  }
};

export const updateGradeOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overviewId } = req.params;
    const updates = req.body;

    const overview = await gradeOverviewService.findById(overviewId);
    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (overview.principalId !== staff.id && overview.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const updated = await gradeOverviewService.update(overviewId, updates);
    res.json({ message: "Overview updated", overview: updated });
  } catch (error) {
    console.error("Error updating grade overview:", error);
    res.status(500).json({ message: "Error updating overview", error: error.message });
  }
};

export const deleteGradeOverview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { overviewId } = req.params;

    const overview = await gradeOverviewService.findById(overviewId);
    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    // Admin users can access all
    const isAdmin = can(req.user, "principalCenter", "view");
    
    if (!isAdmin) {
      const staff = await getOrCreateStaff(userId, req.user);

      if (overview.principalId !== staff.id && overview.createdBy !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await gradeOverviewService.delete(overviewId);
    res.json({ message: "Overview deleted" });
  } catch (error) {
    console.error("Error deleting grade overview:", error);
    res.status(500).json({ message: "Error deleting overview", error: error.message });
  }
};

