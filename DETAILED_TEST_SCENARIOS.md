# IPCC Test Scenarios - Detailed Activity Data Specifications

## 📋 Complete Test Case Templates

Gunakan template ini untuk testing aplikasi IPCC dengan data yang spesifik dan konsisten.

---

## 🔥 TIER 1 Test Cases

### Test Case 1.1: Coal Power Plant
```json
{
  "emissionCategory": {
    "code": "1.A.1.a",
    "name": "Public Electricity and Heat Production",
    "sector": "ENERGY"
  },
  "activityData": {
    "name": "Coal Consumption - Power Plant A",
    "value": 1000,
    "unit": "ton",
    "description": "Sub-bituminous coal for electricity generation"
  },
  "expectedResult": {
    "tier": "TIER_1",
    "gasType": "CO2",
    "emissionFactor": "2.450000 kg_CO2/kg",
    "emission": 2450000,
    "co2Equivalent": 2450000,
    "gwp": 1.0
  }
}
```

### Test Case 1.2: Road Transport
```json
{
  "emissionCategory": {
    "code": "1.A.3.b",
    "name": "Road Transportation",
    "sector": "ENERGY"
  },
  "activityData": {
    "name": "Diesel Fuel Consumption - Fleet Vehicles",
    "value": 5000,
    "unit": "liter",
    "description": "Diesel consumption for truck fleet operations"
  },
  "expectedResult": {
    "tier": "TIER_1",
    "gasType": "CO2",
    "emissionFactor": "Various per liter",
    "notes": "Should auto-select diesel combustion factor"
  }
}
```

### Test Case 1.3: Livestock
```json
{
  "emissionCategory": {
    "code": "3.A.1",
    "name": "Enteric Fermentation",
    "sector": "AFOLU"
  },
  "activityData": {
    "name": "Dairy Cattle Population - Farm C",
    "value": 500,
    "unit": "head",
    "description": "Adult dairy cows for milk production"
  },
  "expectedResult": {
    "tier": "TIER_1",
    "gasType": "CH4",
    "gwp": 28.0,
    "notes": "CH4 from enteric fermentation"
  }
}
```

---

## ⚡ TIER 2 Test Cases

### Test Case 2.1: Natural Gas Power
```json
{
  "emissionCategory": {
    "code": "1.A.1",
    "name": "Energy Industries",
    "sector": "ENERGY"
  },
  "activityData": {
    "name": "Natural Gas Consumption - Power Plant B",
    "value": 500,
    "unit": "ton",
    "description": "Natural gas for combined cycle power generation"
  },
  "expectedResult": {
    "tier": "TIER_2",
    "gasType": "CO2",
    "emissionFactor": "Country-specific or improved factor",
    "notes": "Higher accuracy than TIER_1"
  }
}
```

### Test Case 2.2: Waste Landfill
```json
{
  "emissionCategory": {
    "code": "4.A",
    "name": "Solid Waste Disposal",
    "sector": "WASTE"
  },
  "activityData": {
    "name": "Municipal Solid Waste Disposal - Landfill Site C",
    "value": 10,
    "unit": "ton",
    "description": "Organic waste disposal in anaerobic landfill conditions"
  },
  "expectedResult": {
    "tier": "TIER_2",
    "gasType": "CH4",
    "emissionFactor": "0.350000 ton_CH4/ton_waste",
    "emission": 3.5,
    "emissionUnit": "kg",
    "co2Equivalent": 98,
    "gwp": 28.0
  }
}
```

### Test Case 2.3: Cement Production
```json
{
  "emissionCategory": {
    "code": "2.A.1",
    "name": "Cement Production",
    "sector": "IPPU"
  },
  "activityData": {
    "name": "Cement Production - Plant Delta",
    "value": 1000,
    "unit": "ton",
    "description": "Portland cement production using limestone"
  },
  "expectedResult": {
    "tier": "TIER_2",
    "gasType": "CO2",
    "notes": "Process emissions from limestone calcination"
  }
}
```

---

## 🎯 TIER 3 Test Cases

### Test Case 3.1: CEMS Coal Plant
```json
{
  "emissionCategory": {
    "code": "1.A.1.a",
    "name": "Public Electricity and Heat Production",
    "sector": "ENERGY"
  },
  "activityData": {
    "name": "Sub-bituminous Coal Combustion - PLTU Suralaya Unit 7",
    "value": 2500,
    "unit": "ton",
    "description": "Sub-bituminous coal with facility-specific emission factors from CEMS"
  },
  "expectedResult": {
    "tier": "TIER_3",
    "gasType": "CO2",
    "emissionFactor": "2.510000 kg_CO2/kg",
    "emission": 6275000,
    "co2Equivalent": 6275000,
    "gwp": 1.0,
    "source": "IPCC 2006 Guidelines, Volume 2, Chapter 2, CEMS"
  }
}
```

### Test Case 3.2: Facility-Specific Manure
```json
{
  "emissionCategory": {
    "code": "3.A.2",
    "name": "Manure Management",
    "sector": "AFOLU"
  },
  "activityData": {
    "name": "Swine Manure Management - Farm Echo",
    "value": 1000,
    "unit": "head",
    "description": "Swine manure in anaerobic lagoon system"
  },
  "expectedResult": {
    "tier": "TIER_3",
    "gasType": "CH4",
    "gwp": 28.0,
    "notes": "Facility-specific manure management practices"
  }
}
```

---

## 🧪 Multi-Gas Test Cases

### Test Case M.1: N2O from Fertilizer
```json
{
  "emissionCategory": {
    "code": "3.C.4",
    "name": "Direct N2O Emissions from managed soils",
    "sector": "AFOLU"
  },
  "activityData": {
    "name": "Nitrogen Fertilizer Application - Rice Field Block D",
    "value": 1000,
    "unit": "kg",
    "description": "Urea fertilizer application on irrigated rice fields"
  },
  "expectedResult": {
    "tier": "TIER_1",
    "gasType": "N2O",
    "emissionFactor": "Should use fertilizer-specific factor",
    "gwp": 265.0,
    "notes": "High GWP for N2O"
  }
}
```

### Test Case M.2: Wastewater N2O
```json
{
  "emissionCategory": {
    "code": "4.D.1",
    "name": "Domestic Wastewater",
    "sector": "WASTE"
  },
  "activityData": {
    "name": "Domestic Wastewater Treatment - Plant F",
    "value": 10000,
    "unit": "kg_BOD",
    "description": "BOD load from domestic wastewater treatment"
  },
  "expectedResult": {
    "tier": "TIER_1",
    "gasType": "N2O",
    "gwp": 265.0,
    "notes": "N2O from biological treatment processes"
  }
}
```

---

## 🔍 Validation Checklist

Untuk setiap test case, pastikan:

### ✅ Input Validation
- [ ] Category code valid (ada di constants)
- [ ] Activity name descriptive dan spesifik
- [ ] Unit sesuai dengan category (ton untuk coal, liter untuk fuel, head untuk livestock)
- [ ] Value > 0 dan reasonable

### ✅ Output Validation  
- [ ] Gas type sesuai dengan category (CO2 untuk energy, CH4 untuk livestock/waste, N2O untuk fertilizer)
- [ ] TIER selection correct
- [ ] Emission factor reasonable dan dari source yang benar
- [ ] GWP values sesuai AR5 (CO2=1, CH4=28, N2O=265)
- [ ] CO2-equivalent calculation correct

### ✅ Calculator Performance
- [ ] No errors during calculation
- [ ] Results consistent dengan IPCC Guidelines
- [ ] Factor selection logic works correctly
- [ ] Unit conversions handled properly

---

## 📊 Expected Results Summary

| Category | Activity Type | Expected Gas | TIER | Factor Range | GWP |
|----------|---------------|--------------|------|--------------|-----|
| 1.A.1.a | Coal Power | CO2 | 1-3 | 2.45-2.51 kg/kg | 1 |
| 1.A.3.b | Road Transport | CO2 | 1-2 | Varies/liter | 1 |
| 3.A.1 | Livestock | CH4 | 1-3 | Varies/head | 28 |
| 4.A | Waste Landfill | CH4 | 1-2 | Varies/ton | 28 |
| 3.C.4 | Fertilizer | N2O | 1-3 | Varies/kg_N | 265 |
| 4.D.1 | Wastewater | N2O | 1-2 | Varies/kg_BOD | 265 |

---

## 🚀 Usage Instructions

1. **Manual Testing**: Copy JSON ke input form
2. **Automated Testing**: Import JSON ke test framework  
3. **API Testing**: POST JSON ke calculation endpoint
4. **Validation**: Compare results dengan expected values

**Command untuk run test:**
```bash
npx tsx src/test/ipcc-constants-test.ts
```