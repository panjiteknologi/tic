/**
 * Test script for IPCC Calculation Implementation
 * Tests the coal combustion scenario from the user's requirements
 */

import { calculateEmissions, getIPCCEmissionFactor, getIPCCHeatingValue } from "../lib/ipcc-calculation-helper";

interface TestScenario {
  name: string;
  category: string;
  activity: string;
  activityValue: number;
  activityUnit: string;
  emissionFactor: number;
  heatingValue: number;
  gasType: string;
  gwp: number;
  expectedEmission: number;
  expectedCO2Eq: number;
  tier: "TIER_1" | "TIER_2" | "TIER_3";
}

// Test Scenario 1: Energy Sector - Stationary Combustion (Tier 1)
const coalCombustionScenario: TestScenario = {
  name: "Coal Combustion - Power Plant",
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

function testCoalCombustionCalculation() {
  console.log("🧪 Testing IPCC Coal Combustion Calculation\n");
  
  const scenario = coalCombustionScenario;
  
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
  
  // Quality indicators
  if (result.qualityIndicators.length > 0) {
    console.log("\n⚠️ Quality Indicators:");
    result.qualityIndicators.forEach(indicator => {
      const icon = indicator.type === 'error' ? '❌' : indicator.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${icon} ${indicator.message}`);
    });
  }
  
  return { passed: emissionMatch && co2EqMatch, result };
}

function testIPCCHelperFunctions() {
  console.log("\n🔧 Testing IPCC Helper Functions\n");
  
  // Test heating value lookup
  const coalHV = getIPCCHeatingValue("coal");
  console.log(`Coal heating value: ${coalHV} GJ/ton (expected: 25.8)`);
  
  // Test emission factor lookup  
  const coalEF = getIPCCEmissionFactor("coal");
  console.log(`Coal emission factor: ${coalEF} kg CO2/GJ (expected: 94.6)`);
  
  console.log(`\nHeating value lookup: ${coalHV === 25.8 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Emission factor lookup: ${coalEF === 94.6 ? '✅ PASS' : '❌ FAIL'}`);
}

function runTests() {
  console.log("🚀 IPCC Calculation Test Suite\n");
  console.log("=" .repeat(50));
  
  // Test 1: Coal combustion calculation
  const test1 = testCoalCombustionCalculation();
  
  // Test 2: Helper functions
  testIPCCHelperFunctions();
  
  console.log("\n" + "=".repeat(50));
  console.log(`\n📈 Test Summary:`);
  console.log(`  Coal Combustion Test: ${test1.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1.passed) {
    console.log("\n🎊 All tests passed! The IPCC calculation implementation is working correctly.");
  } else {
    console.log("\n🔧 Some tests failed. Review the implementation for issues.");
  }
}

// Manual calculation verification
function manualCalculation() {
  console.log("\n🧮 Manual Calculation Verification:");
  console.log("Formula: Activity × Heating Value × Emission Factor");
  console.log("Calculation: 1000 ton × 25.8 GJ/ton × 94.6 kg CO2/GJ");
  console.log("Step 1: 1000 × 25.8 = 25,800 GJ");
  console.log("Step 2: 25,800 × 94.6 = 2,440,680 kg CO2");
  console.log("Step 3: 2,440,680 × 1 (GWP) = 2,440,680 kg CO2-eq");
  console.log("Result: 2,441 tons CO2-eq");
}

// Run all tests
if (require.main === module) {
  runTests();
  manualCalculation();
}

export { testCoalCombustionCalculation, testIPCCHelperFunctions, runTests };