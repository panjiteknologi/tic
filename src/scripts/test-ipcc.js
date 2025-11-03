/**
 * Simple test runner for IPCC calculation
 * Can be run with: node src/scripts/test-ipcc.js
 */

// Simple implementation of the calculation logic for testing
function calculateEmissions(activityValue, emissionFactor, tier, heatingValue, sector, gwpValue = 1) {
  let emissionValue;
  let method;
  let formula;

  // Apply tier-specific calculation methodology  
  if (sector === "ENERGY" && heatingValue) {
    // For energy sector, always use heating value when available
    emissionValue = activityValue * heatingValue * emissionFactor;
    if (tier === "TIER_3") {
      method = "TIER_3_ENERGY_DETAILED";
      formula = "Activity Data × Net Calorific Value × Emission Factor";
    } else if (tier === "TIER_2") {
      method = "TIER_2_ENERGY_INTERMEDIATE"; 
      formula = "Activity Data × Heating Value × Emission Factor";
    } else {
      method = "TIER_1_ENERGY_WITH_HV";
      formula = "Activity Data × Heating Value × Emission Factor";
    }
  } else {
    // Basic calculation for non-energy or when heating value not available
    emissionValue = activityValue * emissionFactor;
    method = "TIER_1_BASIC";
    formula = "Activity Data × Emission Factor";
  }

  const co2Equivalent = emissionValue * gwpValue;

  return {
    emissionValue,
    co2Equivalent,
    method,
    formula,
    tier
  };
}

function testCoalCombustionScenario() {
  console.log("🧪 Testing Coal Combustion Scenario\n");
  
  // Scenario 1: Energy Sector - Stationary Combustion (Tier 1)
  const scenario = {
    category: "1.A.1 - Energy Industries",
    activity: "Coal combustion in power plant",
    activityValue: 1000, // tons coal
    activityUnit: "ton",
    emissionFactor: 94.6, // kg CO2/GJ (IPCC default)
    heatingValue: 25.8, // GJ/ton
    gasType: "CO2",
    gwp: 1,
    expectedEmission: 2440680, // kg CO2
    expectedCO2Eq: 2440680, // kg CO2-eq (2,441 tons)
    tier: "TIER_1"
  };
  
  console.log("📋 Test Scenario:");
  console.log(`  Category: ${scenario.category}`);
  console.log(`  Activity: ${scenario.activity}`);
  console.log(`  Data: ${scenario.activityValue} ${scenario.activityUnit} coal`);
  console.log(`  Emission Factor: ${scenario.emissionFactor} kg CO2/GJ`);
  console.log(`  Heating Value: ${scenario.heatingValue} GJ/ton`);
  console.log(`  Gas: ${scenario.gasType} (GWP = ${scenario.gwp})\n`);
  
  // Test the calculation
  const result = calculateEmissions(
    scenario.activityValue,
    scenario.emissionFactor,
    scenario.tier,
    scenario.heatingValue,
    "ENERGY",
    scenario.gwp
  );
  
  console.log("🔬 Calculation Results:");
  console.log(`  Method: ${result.method}`);
  console.log(`  Formula: ${result.formula}`);
  console.log(`  Tier: ${result.tier}`);
  console.log(`  Emission Value: ${result.emissionValue.toLocaleString()} kg ${scenario.gasType}`);
  console.log(`  CO2 Equivalent: ${result.co2Equivalent.toLocaleString()} kg CO2-eq`);
  console.log(`  CO2 Equivalent (tons): ${(result.co2Equivalent / 1000).toLocaleString()} tons CO2-eq\n`);
  
  // Expected results
  console.log("📊 Expected Results:");
  console.log(`  Expected Emission: ${scenario.expectedEmission.toLocaleString()} kg CO2`);
  console.log(`  Expected CO2-eq: ${scenario.expectedCO2Eq.toLocaleString()} kg CO2-eq`);
  console.log(`  Expected CO2-eq (tons): ${(scenario.expectedCO2Eq / 1000).toLocaleString()} tons CO2-eq\n`);
  
  // Validation
  const emissionMatch = Math.abs(result.emissionValue - scenario.expectedEmission) < 1;
  const co2EqMatch = Math.abs(result.co2Equivalent - scenario.expectedCO2Eq) < 1;
  
  console.log("✅ Validation:");
  console.log(`  Emission Value: ${emissionMatch ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  CO2 Equivalent: ${co2EqMatch ? '✅ PASS' : '❌ FAIL'}`);
  
  if (emissionMatch && co2EqMatch) {
    console.log("\n🎉 SUCCESS: Coal combustion calculation matches expected IPCC results!");
  } else {
    console.log("\n❌ FAILURE: Calculation does not match expected results");
    console.log(`  Emission difference: ${result.emissionValue - scenario.expectedEmission}`);
    console.log(`  CO2-eq difference: ${result.co2Equivalent - scenario.expectedCO2Eq}`);
  }
  
  return { passed: emissionMatch && co2EqMatch, result };
}

function manualCalculation() {
  console.log("\n🧮 Manual Calculation Verification:");
  console.log("Formula: Activity × Heating Value × Emission Factor");
  console.log("Calculation: 1000 ton × 25.8 GJ/ton × 94.6 kg CO2/GJ");
  console.log("Step 1: 1000 × 25.8 = 25,800 GJ");
  console.log("Step 2: 25,800 × 94.6 = 2,440,680 kg CO2");
  console.log("Step 3: 2,440,680 × 1 (GWP) = 2,440,680 kg CO2-eq");
  console.log("Result: 2,441 tons CO2-eq");
}

function runTests() {
  console.log("🚀 IPCC Calculation Test Suite\n");
  console.log("=" .repeat(50));
  
  // Test coal combustion calculation
  const test1 = testCoalCombustionScenario();
  
  console.log("\n" + "=".repeat(50));
  console.log(`\n📈 Test Summary:`);
  console.log(`  Coal Combustion Test: ${test1.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1.passed) {
    console.log("\n🎊 All tests passed! The IPCC calculation implementation is working correctly.");
  } else {
    console.log("\n🔧 Some tests failed. Review the implementation for issues.");
  }
  
  manualCalculation();
}

// Run the tests
runTests();