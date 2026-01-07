/**
 * One-time Script: Create Benefit Records from Payroll Data
 * 
 * This script finds all existing staff members with payroll data containing
 * benefit information and creates benefit records for them.
 * 
 * Usage:
 *   node server/db/scripts/createBenefitsFromPayroll.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializePostgres, query } from "../postgresConnect.js";
import { staffBenefitService } from "../services/staffManagementService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function createBenefitsFromPayroll() {
  try {
    console.log("🔍 Finding staff members with payroll benefit data...\n");

    // Find all staff with payroll data that has benefit information
    const payrollResult = await query(`
      SELECT 
        sp.staff_id,
        sp.insurance,
        sp.retirement_403b,
        sp.cc_name,
        sp.cc_annual_amount,
        sp.nachlas,
        sp.other_benefit,
        sp.parsonage,
        sp.parsonage_allocation,
        sp.travel,
        sp.academic_year,
        s.first_name,
        s.last_name,
        s.hire_date
      FROM staff_payroll sp
      INNER JOIN staff s ON sp.staff_id = s.id
      WHERE (
        sp.insurance IS NOT NULL OR
        sp.retirement_403b IS NOT NULL OR
        sp.cc_annual_amount IS NOT NULL OR
        sp.nachlas IS NOT NULL OR
        sp.other_benefit IS NOT NULL OR
        sp.parsonage IS NOT NULL OR
        sp.travel IS NOT NULL
      )
      ORDER BY s.last_name, s.first_name
    `);

    if (payrollResult.rows.length === 0) {
      console.log("ℹ️  No staff members found with benefit data.");
      return;
    }

    console.log(`Found ${payrollResult.rows.length} staff member(s) with benefit data.\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const payroll of payrollResult.rows) {
      const staffId = payroll.staff_id;
      const staffName = `${payroll.first_name} ${payroll.last_name}`;

      try {
        // Get existing benefits for this staff member
        const existingBenefits = await staffBenefitService.findByStaffId(staffId);
        
        // Determine effective date (use hire date if available, otherwise use payroll creation date or today)
        let effectiveDate = payroll.hire_date;
        if (!effectiveDate) {
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
          effectiveDate = new Date(effectiveDate).toISOString().split('T')[0];
        }

        const benefitsCreated = [];

        // Map payroll fields to benefit records
        const benefitMappings = [
          {
            field: 'insurance',
            type: 'health_insurance',
            name: 'Health Insurance',
            amount: payroll.insurance,
            employerContribution: payroll.insurance,
          },
          {
            field: 'retirement403b',
            type: 'retirement',
            name: '403B Retirement',
            amount: payroll.retirement_403b,
            employerContribution: payroll.retirement_403b,
          },
          {
            field: 'ccAnnualAmount',
            type: 'other',
            name: payroll.cc_name || 'CC Benefit',
            amount: payroll.cc_annual_amount,
            employerContribution: payroll.cc_annual_amount,
          },
          {
            field: 'nachlas',
            type: 'other',
            name: 'Nachlas',
            amount: payroll.nachlas,
            employerContribution: payroll.nachlas,
          },
          {
            field: 'otherBenefit',
            type: 'other',
            name: 'Other Benefit',
            amount: payroll.other_benefit,
            employerContribution: payroll.other_benefit,
          },
          {
            field: 'parsonage',
            type: 'parsonage',
            name: 'Parsonage',
            amount: payroll.parsonage,
            employerContribution: payroll.parsonage,
          },
          {
            field: 'travel',
            type: 'other',
            name: 'Travel',
            amount: payroll.travel,
            employerContribution: payroll.travel,
          },
        ];

        for (const mapping of benefitMappings) {
          const value = mapping.amount;
          
          // Skip if value is null, undefined, or 0
          if (!value || parseFloat(value) <= 0) {
            continue;
          }

          const amount = parseFloat(value);

          // Check if this benefit already exists (same type and similar amount)
          const hasMatchingBenefit = existingBenefits.some(
            (benefit) =>
              benefit.benefitType === mapping.type &&
              Math.abs((benefit.employerContribution || 0) - amount) < 1
          );

          if (hasMatchingBenefit) {
            console.log(`  ⏭️  Skipping ${mapping.name} for ${staffName} - benefit already exists`);
            skipped++;
            continue;
          }

          // Create benefit record
          await staffBenefitService.create({
            staffId,
            benefitType: mapping.type,
            benefitName: mapping.name,
            employerContribution: amount,
            employeeContribution: 0,
            effectiveDate,
            notes: `Created from payroll data (${payroll.academic_year || '25-26'})`,
          });

          benefitsCreated.push(`${mapping.name}: $${amount.toLocaleString()}`);
          created++;
        }

        if (benefitsCreated.length > 0) {
          console.log(`✅ Created ${benefitsCreated.length} benefit(s) for ${staffName}:`);
          benefitsCreated.forEach(b => console.log(`     - ${b}`));
        }

      } catch (error) {
        console.error(`❌ Error processing ${staffName}:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   ✅ Created: ${created} benefit record(s)`);
    console.log(`   ⏭️  Skipped: ${skipped} (already exists)`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Error running script:", error);
    throw error;
  }
}

// Only run if called directly as a script (not when imported)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('createBenefitsFromPayroll.js')) {
  (async () => {
    try {
      console.log("🚀 Starting benefit creation from payroll data...\n");
      await initializePostgres();
      await createBenefitsFromPayroll();
      console.log("✅ Script completed successfully!");
      process.exit(0);
    } catch (error) {
      console.error("❌ Script failed:", error);
      process.exit(1);
    }
  })();
}

export default createBenefitsFromPayroll;

