/**
 * One-time Script: Create Salary Records from Payroll Total Package
 * 
 * This script finds all existing staff members with payroll data containing
 * totalPackage2526 and creates salary records for them if they don't already exist.
 * 
 * Usage:
 *   node server/db/scripts/createSalariesFromPayroll.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializePostgres, query } from "../postgresConnect.js";
import { staffSalaryService } from "../services/staffManagementService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function createSalariesFromPayroll() {
  try {
    console.log("🔍 Finding staff members with payroll total package data...\n");

    // Find all staff with payroll data that has totalPackage2526
    const payrollResult = await query(`
      SELECT 
        sp.staff_id,
        sp.total_package_25_26,
        sp.academic_year,
        s.first_name,
        s.last_name,
        s.hire_date
      FROM staff_payroll sp
      INNER JOIN staff s ON sp.staff_id = s.id
      WHERE sp.total_package_25_26 IS NOT NULL
        AND sp.total_package_25_26 > 0
      ORDER BY s.last_name, s.first_name
    `);

    if (payrollResult.rows.length === 0) {
      console.log("ℹ️  No staff members found with total package data.");
      return;
    }

    console.log(`Found ${payrollResult.rows.length} staff member(s) with total package data.\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const payroll of payrollResult.rows) {
      const staffId = payroll.staff_id;
      const totalPackage = parseFloat(payroll.total_package_25_26);
      const staffName = `${payroll.first_name} ${payroll.last_name}`;

      try {
        // Check if staff member already has a salary record
        const existingSalaries = await staffSalaryService.findByStaffId(staffId);

        // Check if there's already a salary with this amount (within $1 tolerance)
        const hasMatchingSalary = existingSalaries.some(
          (salary) => Math.abs(salary.salaryAmount - totalPackage) < 1
        );

        if (hasMatchingSalary) {
          console.log(`⏭️  Skipping ${staffName} - salary record already exists with this amount`);
          skipped++;
          continue;
        }

        // Determine effective date (use hire date if available, otherwise use payroll creation date or today)
        let effectiveDate = payroll.hire_date;
        if (!effectiveDate) {
          // Try to get payroll creation date
          const payrollCreated = await query(
            "SELECT created_at FROM staff_payroll WHERE staff_id = $1 ORDER BY created_at ASC LIMIT 1",
            [staffId]
          );
          if (payrollCreated.rows.length > 0 && payrollCreated.rows[0].created_at) {
            effectiveDate = payrollCreated.rows[0].created_at.toISOString().split('T')[0];
          } else {
            effectiveDate = new Date().toISOString().split('T')[0];
          }
        } else {
          // Ensure it's in YYYY-MM-DD format
          effectiveDate = new Date(effectiveDate).toISOString().split('T')[0];
        }

        // Create salary record
        await staffSalaryService.create({
          staffId,
          salaryAmount: totalPackage,
          salaryType: 'annual',
          effectiveDate,
          payFrequency: 'monthly',
          notes: `Created from payroll total package (${payroll.academic_year || '25-26'})`,
        });

        console.log(`✅ Created salary for ${staffName}: $${totalPackage.toLocaleString()} (effective: ${effectiveDate})`);
        created++;
      } catch (error) {
        console.error(`❌ Error processing ${staffName}:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   ✅ Created: ${created} salary record(s)`);
    console.log(`   ⏭️  Skipped: ${skipped} (already exists)`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Error running script:", error);
    throw error;
  }
}

// Only run if called directly as a script (not when imported)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('createSalariesFromPayroll.js')) {
  (async () => {
    try {
      console.log("🚀 Starting salary creation from payroll data...\n");
      await initializePostgres();
      await createSalariesFromPayroll();
      console.log("✅ Script completed successfully!");
      process.exit(0);
    } catch (error) {
      console.error("❌ Script failed:", error);
      process.exit(1);
    }
  })();
}

export default createSalariesFromPayroll;

