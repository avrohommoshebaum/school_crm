/**
 * Script to delete all students from the database
 * WARNING: This will permanently delete all student records
 * Run with: node server/db/scripts/deleteAllStudents.js
 */

import { query } from "../postgresConnect.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function deleteAllStudents() {
  try {
    console.log("⚠️  WARNING: This will delete ALL students from the database!");
    console.log("This includes:");
    console.log("  - All student records");
    console.log("  - All student-parent relationships");
    console.log("  - All student-class assignments");
    console.log("  - All student-principal assignments");
    console.log("  - All student-sibling relationships");
    console.log("  - All related records");
    console.log("");

    const answer = await question("Are you sure you want to proceed? Type 'DELETE ALL STUDENTS' to confirm: ");

    if (answer !== "DELETE ALL STUDENTS") {
      console.log("Operation cancelled.");
      rl.close();
      return;
    }

    console.log("\nDeleting all students...");

    // Delete in order to respect foreign key constraints
    // 1. Delete student-parent relationships
    const studentParentsResult = await query("DELETE FROM student_parents RETURNING id");
    console.log(`Deleted ${studentParentsResult.rowCount} student-parent relationships`);

    // 2. Delete student-class assignments
    const studentClassesResult = await query("DELETE FROM student_classes RETURNING id");
    console.log(`Deleted ${studentClassesResult.rowCount} student-class assignments`);

    // 3. Delete student-principal assignments
    const studentPrincipalsResult = await query("DELETE FROM student_principals RETURNING id");
    console.log(`Deleted ${studentPrincipalsResult.rowCount} student-principal assignments`);

    // 4. Delete student-sibling relationships
    const studentSiblingsResult = await query("DELETE FROM student_siblings RETURNING id");
    console.log(`Deleted ${studentSiblingsResult.rowCount} student-sibling relationships`);

    // 5. Delete students (this will cascade to other relationships)
    const studentsResult = await query("DELETE FROM students RETURNING id");
    console.log(`Deleted ${studentsResult.rowCount} students`);

    console.log("\n✅ All students have been deleted successfully!");
    console.log("Note: Families and parents remain in the database.");

  } catch (error) {
    console.error("❌ Error deleting students:", error);
    throw error;
  } finally {
    rl.close();
  }
}

// Run the script
deleteAllStudents()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
