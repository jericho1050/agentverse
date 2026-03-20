#!/bin/bash
# Run 10 diverse medical document verifications to populate HCS
# Usage: ./scripts/run-verifications.sh [BASE_URL]

BASE_URL="${1:-http://3.83.131.186:3000}"
echo "Running verifications against: $BASE_URL"
echo "=========================================="

# 1. Complete Blood Count (CBC)
echo -e "\n[1/10] Complete Blood Count..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"COMPLETE BLOOD COUNT (CBC)\nPatient: Jane Doe | DOB: 1985-03-15 | Date: 2026-03-18\nOrdering Physician: Dr. Smith, Internal Medicine\nLab: City Medical Lab | CLIA#: 12D3456789\n\nTest               Result    Unit       Reference Range    Flag\nWhite Blood Cells  7.2       10^3/uL    4.5-11.0          Normal\nRed Blood Cells    4.8       10^6/uL    4.2-5.4           Normal\nHemoglobin         14.2      g/dL       12.0-16.0         Normal\nHematocrit         42.1      %          36.0-46.0         Normal\nPlatelet Count     245       10^3/uL    150-400           Normal\nMCV                87.7      fL         80.0-100.0        Normal\nMCH                29.6      pg         27.0-33.0         Normal\nMCHC               33.7      g/dL       32.0-36.0         Normal\n\nNotes: All values within normal limits. No further action required.\nVerified by: Lab Director"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100, HCS: {d[\"data\"].get(\"hcsTxId\",\"N/A\")[:30]}')" 2>/dev/null
echo "  Done."

# 2. Amoxicillin Prescription
echo -e "\n[2/10] Amoxicillin Prescription..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"PRESCRIPTION\nDate: 2026-03-15\nPatient: John Smith | DOB: 1990-07-22\nPrescriber: Dr. Sarah Johnson, MD | DEA#: BJ1234567 | NPI: 1234567890\n\nRx: Amoxicillin 500mg capsules\nSig: Take 1 capsule by mouth 3 times daily for 10 days\nQty: 30 (thirty) capsules\nRefills: 0 (zero)\n\nDiagnosis: Acute bacterial sinusitis (J01.90)\nAllergies: NKDA\n\nSignature: Dr. Sarah Johnson, MD\nPhone: (555) 123-4567"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 3. Lipid Panel
echo -e "\n[3/10] Lipid Panel..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"LIPID PANEL\nPatient: Maria Garcia | DOB: 1978-11-03 | Date: 2026-03-10\nOrdering Physician: Dr. Chen\nFasting: Yes (12 hours)\n\nTotal Cholesterol    215    mg/dL    <200 Desirable      HIGH\nLDL Cholesterol      140    mg/dL    <100 Optimal        HIGH\nHDL Cholesterol       55    mg/dL    >60 Desirable       LOW\nTriglycerides        120    mg/dL    <150 Normal         Normal\nVLDL                  24    mg/dL    <30 Normal          Normal\nTotal/HDL Ratio      3.9             <5.0 Desirable      Normal\n\nInterpretation: Elevated total and LDL cholesterol. Recommend lifestyle modifications and follow-up in 3 months.\nVerified by: Clinical Chemistry Lab Director"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 4. Diagnosis Report
echo -e "\n[4/10] Diagnosis Report - Type 2 Diabetes..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"CLINICAL DIAGNOSIS REPORT\nDate: 2026-02-28\nPatient: Robert Lee | DOB: 1965-08-20 | MRN: 456789\nPhysician: Dr. Amanda Williams, Endocrinology\n\nDiagnosis: Type 2 Diabetes Mellitus (E11.9)\n\nClinical Findings:\n- Fasting blood glucose: 185 mg/dL (normal: 70-100)\n- HbA1c: 8.2% (normal: <5.7%)\n- BMI: 31.5 (obese)\n- Family history: Mother with T2DM\n\nTreatment Plan:\n1. Metformin 500mg twice daily\n2. Dietary counseling referral\n3. Blood glucose monitoring daily\n4. Follow-up in 3 months with repeat HbA1c\n\nPatient Education: Discussed disease process, medication side effects, hypoglycemia symptoms, and importance of lifestyle modifications.\n\nSigned: Dr. Amanda Williams, MD, FACE"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 5. X-Ray Report
echo -e "\n[5/10] Chest X-Ray Report..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"RADIOLOGY REPORT - CHEST X-RAY\nDate: 2026-03-12 | Patient: Emily Chen | DOB: 1992-04-18\nOrdering: Dr. Park | Radiologist: Dr. Kim, MD\n\nFindings:\n- Heart size normal\n- Lungs clear bilaterally\n- No pleural effusion\n- No pneumothorax\n- Mediastinum unremarkable\n- Bony structures intact\n\nImpression: Normal chest radiograph. No acute cardiopulmonary process.\n\nSigned: Dr. Kim, Board Certified Radiologist"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 6. Thyroid Panel
echo -e "\n[6/10] Thyroid Function Panel..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"THYROID FUNCTION PANEL\nPatient: Susan Park | DOB: 1970-06-15 | Date: 2026-03-08\nPhysician: Dr. Martinez\n\nTSH           0.3    mIU/L    0.4-4.0     LOW\nFree T4       2.8    ng/dL    0.8-1.8     HIGH\nFree T3       5.2    pg/mL    2.3-4.2     HIGH\nT4 Total     14.5    ug/dL    4.5-12.0    HIGH\n\nInterpretation: Results consistent with hyperthyroidism. Recommend thyroid antibody panel and endocrinology referral.\nLab: Regional Medical Center"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 7. Incomplete Document (to show red flags)
echo -e "\n[7/10] Incomplete Prescription (should flag issues)..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"Rx: Oxycodone 30mg\nTake 2 tablets every 4 hours as needed for pain\nQty: 120\nRefills: 5"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 8. Metabolic Panel
echo -e "\n[8/10] Comprehensive Metabolic Panel..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"COMPREHENSIVE METABOLIC PANEL (CMP)\nPatient: David Wilson | DOB: 1955-12-01 | Date: 2026-03-14\nFasting: Yes\n\nGlucose         95    mg/dL    70-100     Normal\nBUN             18    mg/dL    7-20       Normal\nCreatinine      1.0   mg/dL    0.7-1.3    Normal\nSodium         140    mEq/L    136-145    Normal\nPotassium       4.2   mEq/L    3.5-5.0    Normal\nChloride       101    mEq/L    98-106     Normal\nCO2             24    mEq/L    23-29      Normal\nCalcium          9.5  mg/dL    8.5-10.5   Normal\nTotal Protein    7.0  g/dL     6.0-8.3    Normal\nAlbumin          4.2  g/dL     3.5-5.5    Normal\nBilirubin        0.8  mg/dL    0.1-1.2    Normal\nAlk Phos        72    U/L      44-147     Normal\nAST             25    U/L      10-40      Normal\nALT             28    U/L      7-56       Normal\neGFR           >90    mL/min   >60        Normal\n\nAll values within normal limits. Kidney and liver function normal."}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 9. Vaccination Record
echo -e "\n[9/10] Vaccination Record..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"IMMUNIZATION RECORD\nPatient: Lisa Anderson | DOB: 2000-01-10\nProvider: City Health Clinic\n\nDate        Vaccine                  Lot#        Site    Administrator\n2026-01-15  COVID-19 Moderna Bivalent  M123456    L Arm   RN Smith\n2025-09-20  Influenza (Fluzone HD)     F789012    R Arm   RN Jones\n2025-03-10  Tdap (Boostrix)           T345678    L Arm   RN Smith\n2024-08-15  HPV (Gardasil 9) Dose 3   H901234    L Arm   RN Davis\n\nNo adverse reactions reported.\nNext due: Annual influenza (Fall 2026)"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

# 10. Allergy Test Results
echo -e "\n[10/10] Allergy Panel Results..."
curl -s -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"documentText":"ALLERGY PANEL - SPECIFIC IgE\nPatient: Michael Brown | DOB: 1988-05-30 | Date: 2026-03-05\nPhysician: Dr. Lee, Allergy & Immunology\n\nAllergen          Result (kU/L)   Class    Interpretation\nDust Mite          15.4           3        Moderate\nCat Dander          8.7           3        Moderate\nDog Dander          0.2           0        Negative\nGrass Pollen       42.1           4        High\nTree Pollen        28.3           4        High\nMold (Alternaria)   3.5           2        Low\nPeanut              0.1           0        Negative\nEgg White           0.0           0        Negative\nMilk                0.1           0        Negative\n\nTotal IgE: 385 IU/mL (normal: <100)\n\nAssessment: Significant environmental allergies. Recommend allergen avoidance and consider immunotherapy.\nSigned: Dr. Lee, MD, FAAAAI"}' \
  --max-time 60 | grep "verification_complete" | head -1 | python3 -c "import sys,json; d=json.loads(sys.stdin.readline()[6:]); print(f'  Score: {d[\"data\"][\"overallScore\"]}/100')" 2>/dev/null
echo "  Done."

echo -e "\n=========================================="
echo "All 10 verifications complete!"
echo "Check HashScan: https://hashscan.io/testnet/topic/0.0.8236051"
echo "=========================================="
