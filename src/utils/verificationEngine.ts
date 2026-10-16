import { Chef, ChefVerificationReport, VerificationStatus } from '../types';

export interface VerificationCheckStep {
  id: string;
  label: string;
  authority: string;
  database: string;
  durationMs: number;
  resultStatus: 'passed' | 'review_required' | 'failed';
  details: string;
}

export interface VerificationSimResult {
  chefId: string;
  chefName: string;
  status: VerificationStatus;
  passed: boolean;
  score: number;
  report: ChefVerificationReport;
  auditTrail: {
    step: string;
    authority: string;
    timestamp: string;
    status: 'ok' | 'flagged';
    message: string;
  }[];
}

/**
 * Predefined mock government database registries simulated across India:
 * 1. National CCTNS & State Police Criminal Tracking Network (All 28 States & 8 UTs)
 * 2. UIDAI & NSDL (Aadhaar & PAN biometric deduplication & KYC match - Govt of India)
 * 3. FSSAI Food Safety and Standards Authority of India (Central & State Licensing)
 * 4. NABL Accredited Food Safety Hygiene & Microbial Surface Swab Audit
 */
export const GOVERNMENT_REGISTRIES = [
  {
    code: 'CCTNS_NATIONAL',
    name: 'National CCTNS Inter-State Police Crime Records Registry',
    jurisdiction: 'Ministry of Home Affairs & NCRB, New Delhi (Multi-State Jurisdiction)',
    endpoint: 'api.cctns.gov.in/v2/national-pcc-verify',
  },
  {
    code: 'UIDAI_PAN',
    name: 'National Identity & Tax Identification Gateway (UIDAI / NSDL)',
    jurisdiction: 'Government of India Digital Identity Framework',
    endpoint: 'uidai.gov.in/auth/v3.1/offline-kyc',
  },
  {
    code: 'FSSAI_FOSCOS',
    name: 'FSSAI Food Safety Compliance System (FoSCoS Pan-India)',
    jurisdiction: 'Ministry of Health and Family Welfare, New Delhi',
    endpoint: 'foscos.fssai.gov.in/portal/verify-license',
  },
  {
    code: 'NABL_HYGIENE',
    name: 'NABL Accredited Kitchen Microbial & Sanitation Inspection',
    jurisdiction: 'National Accreditation Board for Testing and Calibration Laboratories',
    endpoint: 'nabl-india.org/lab/audit/food-handlers',
  },
];

/**
 * Creates an authentic default verification report for a chef in any Indian city.
 */
export function generateDefaultReport(chef: Chef, status: VerificationStatus = 'verified'): ChefVerificationReport {
  const isOk = status === 'verified';
  const now = new Date().toISOString();
  const cityName = chef.cityName || 'Bengaluru';
  const stateLabel = chef.cityId === 'mumbai' || chef.cityId === 'pune' ? 'Maharashtra'
    : chef.cityId === 'delhi_ncr' ? 'Delhi NCR'
    : chef.cityId === 'hyderabad' ? 'Telangana'
    : chef.cityId === 'chennai' ? 'Tamil Nadu'
    : chef.cityId === 'kolkata' ? 'West Bengal'
    : chef.cityId === 'jaipur' || chef.cityId === 'udaipur' ? 'Rajasthan'
    : chef.cityId === 'goa' ? 'Goa'
    : chef.cityId === 'kochi' ? 'Kerala'
    : chef.cityId === 'lucknow' || chef.cityId === 'varanasi' ? 'Uttar Pradesh'
    : 'Karnataka';

  const policeJurisdiction = `${cityName} Police Commissionerate & ${stateLabel} CCTNS`;
  const stateCode = stateLabel.slice(0, 2).toUpperCase();

  return {
    status,
    overallScore: isOk ? 98 : status === 'pending' ? 62 : 44,
    verifiedDate: isOk ? '2026-09-15' : 'In Review',
    dossierNumber: `IND-${stateCode}-${chef.id.replace('chef-', '').toUpperCase()}-2026-X99`,
    karnatakaPolicePCC: {
      reference: `PCC-${stateCode}-${Math.floor(100000 + Math.random() * 900000)}`,
      status: isOk ? 'passed' : status === 'flagged' ? 'flagged' : 'pending',
      crimeRecordClear: isOk,
      jurisdiction: policeJurisdiction,
      verifiedAt: isOk ? '2026-09-14 14:22:00' : now,
    },
    statePolicePCC: {
      reference: `PCC-${stateCode}-${Math.floor(100000 + Math.random() * 900000)}`,
      status: isOk ? 'passed' : status === 'flagged' ? 'flagged' : 'pending',
      crimeRecordClear: isOk,
      jurisdiction: policeJurisdiction,
      state: stateLabel,
      verifiedAt: isOk ? '2026-09-14 14:22:00' : now,
    },
    aadhaarPANVerification: {
      maskedAadhaar: 'XXXX-XXXX-4819',
      maskedPAN: 'ABCDE****K',
      status: isOk ? 'passed' : 'pending',
      nameMatchPercentage: isOk ? 99.4 : 78.0,
      dobVerified: true,
    },
    fssaiCertification: {
      licenseNumber: `1122633${Math.floor(1000000 + Math.random() * 9000000)}`,
      category: 'Specialized Food Handler & Caterer (Category 16)',
      validThrough: '2028-12-31',
      status: isOk ? 'passed' : 'pending',
    },
    kitchenHygieneAudit: {
      score: isOk ? 98 : 72,
      auditor: `Dr. Ramesh Rao (Lead Inspector, NABL Cert #${stateCode}-881)`,
      swabCultureTest: 'negative',
      status: isOk ? 'passed' : 'review_required',
    },
    checks: [
      {
        id: 'chk-cctns',
        name: `${stateLabel} Police CCTNS Crime Clearance`,
        authority: policeJurisdiction,
        status: isOk ? 'passed' : status === 'flagged' ? 'review_required' : 'in_progress',
        referenceId: `PCC-${stateCode}-${chef.id.slice(-2)}`,
        verifiedAt: isOk ? '2026-09-14' : undefined,
        notes: isOk ? `Zero criminal records, non-bailable warrants, or FIRs found across ${stateLabel} and national CCTNS database.` : 'Under active cross-jurisdictional review.',
      },
      {
        id: 'chk-identity',
        name: 'Aadhaar & PAN Biometric Match',
        authority: 'UIDAI & Income Tax Department',
        status: isOk ? 'passed' : 'in_progress',
        referenceId: 'KYC-2026-UID-991',
        verifiedAt: isOk ? '2026-09-14' : undefined,
        notes: 'Biometric and face-match 99.4% congruence with Aadhaar database records.',
      },
      {
        id: 'chk-fssai',
        name: 'FSSAI FoSCoS License Validation',
        authority: 'Food Safety and Standards Authority of India',
        status: isOk ? 'passed' : 'in_progress',
        referenceId: 'FSSAI-LIC-11224',
        verifiedAt: isOk ? '2026-09-15' : undefined,
        notes: 'Active food handler certificate; food safety and allergen management training verified.',
      },
      {
        id: 'chk-hygiene',
        name: 'Microbial Swab & Health Vetting',
        authority: 'NABL Certified Diagnostics Laboratory',
        status: isOk ? 'passed' : 'review_required',
        referenceId: 'NABL-SWAB-8841',
        verifiedAt: isOk ? '2026-09-15' : undefined,
        notes: 'Nails, palm swabs and apron samples negative for Salmonella, E. Coli, and S. Aureus.',
      },
    ],
    lastAuditedTimestamp: now,
  };
}

/**
 * Mock API simulation function to verify a chef against government databases.
 * Simulates async latency, querying CCTNS, UIDAI, and FSSAI systems in sequential real-time ticks.
 *
 * @param chef The target Chef to verify
 * @param outcome Optional forced outcome to test flagging/rejection or success
 * @param onProgress Optional callback for animated UI stepper progress
 * @returns Promise<VerificationSimResult>
 */
export async function verifyChefGovernmentBackground(
  chef: Chef,
  outcome: 'pass' | 'fail_criminal_flag' | 'require_manual_review' = 'pass',
  onProgress?: (stepIndex: number, stepName: string, stepDetail: string) => void
): Promise<VerificationSimResult> {
  const steps: VerificationCheckStep[] = [
    {
      id: 'step-1',
      label: 'Connecting to Gov Gateway & Token Authentication',
      authority: 'National Informatics Centre (NIC) Gateway',
      database: 'secure-auth.gov.in/mfa/api-session',
      durationMs: 700,
      resultStatus: 'passed',
      details: 'Handshake complete. Secure AES-256 session established with state registries.',
    },
    {
      id: 'step-2',
      label: 'Karnataka CCTNS Criminal Registry & Police Clearance Check',
      authority: 'Bengaluru City Police & KSP CCTNS Portal',
      database: 'cctns.ksp.gov.in/record-search/statewide',
      durationMs: 1100,
      resultStatus: outcome === 'fail_criminal_flag' ? 'failed' : 'passed',
      details: outcome === 'fail_criminal_flag'
        ? 'Alert: Minor name collision in jurisdictional docket requiring manual verification.'
        : 'Zero criminal records, non-bailable warrants, or pending FIRs detected across all police stations.',
    },
    {
      id: 'step-3',
      label: 'UIDAI Aadhaar Biometric & PAN Identity Reconciliation',
      authority: 'Unique Identification Authority of India (UIDAI)',
      database: 'resident.uidai.gov.in/offline-aadhaar-vault',
      durationMs: 900,
      resultStatus: 'passed',
      details: 'Full demographic match: Name, DoB, and residential address verified via OTP and face authentication.',
    },
    {
      id: 'step-4',
      label: 'FSSAI Food Safety & FoSCoS Commercial Catering License Audit',
      authority: 'Food Safety and Standards Authority of India (FSSAI)',
      database: 'foscos.fssai.gov.in/central-licensing/lookup',
      durationMs: 800,
      resultStatus: outcome === 'require_manual_review' ? 'review_required' : 'passed',
      details: outcome === 'require_manual_review'
        ? 'Notice: FSSAI category renewal pending within 45 days. Flagged for administrative refresh.'
        : 'Active Commercial Caterer & Food Handler license verified. Allergen management protocol certified.',
    },
    {
      id: 'step-5',
      label: 'NABL Hygiene Audit & Medical Fitness Certification',
      authority: 'NABL Certified Clinical Laboratory',
      database: 'nabl.gov.in/food-microbiology-registry',
      durationMs: 650,
      resultStatus: 'passed',
      details: 'Typhoid/Hepatitis-A vaccination records up to date. Microbial hand and apron swabs cleared.',
    },
  ];

  const auditTrail: VerificationSimResult['auditTrail'] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (onProgress) {
      onProgress(i, step.label, step.details);
    }
    // Simulate real network delay
    await new Promise((resolve) => setTimeout(resolve, step.durationMs));

    const isStepFlagged = step.resultStatus !== 'passed';
    auditTrail.push({
      step: step.label,
      authority: step.authority,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      status: isStepFlagged ? 'flagged' : 'ok',
      message: step.details,
    });
  }

  // Determine final outcome
  let finalStatus: VerificationStatus = 'verified';
  let overallScore = 98;
  let crimeClear = true;

  if (outcome === 'fail_criminal_flag') {
    finalStatus = 'flagged';
    overallScore = 48;
    crimeClear = false;
  } else if (outcome === 'require_manual_review') {
    finalStatus = 'pending';
    overallScore = 74;
  }

  const now = new Date().toISOString();
  const report: ChefVerificationReport = {
    status: finalStatus,
    overallScore,
    verifiedDate: finalStatus === 'verified' ? new Date().toISOString().split('T')[0] : 'Under Review',
    dossierNumber: `KSP-BLR-${chef.id.replace('chef-', '').toUpperCase()}-${new Date().getFullYear()}-V9`,
    karnatakaPolicePCC: {
      reference: `PCC-KA-BLR-${Math.floor(100000 + Math.random() * 900000)}`,
      status: finalStatus === 'verified' ? 'passed' : finalStatus === 'flagged' ? 'flagged' : 'pending',
      crimeRecordClear: crimeClear,
      jurisdiction: 'Bengaluru City Police (Indiranagar / Koramangala Station)',
      verifiedAt: now,
    },
    aadhaarPANVerification: {
      maskedAadhaar: 'XXXX-XXXX-4819',
      maskedPAN: 'ABCDE****K',
      status: 'passed',
      nameMatchPercentage: 99.4,
      dobVerified: true,
    },
    fssaiCertification: {
      licenseNumber: `1122633${Math.floor(1000000 + Math.random() * 9000000)}`,
      category: 'Specialized Food Handler & Caterer (Category 16)',
      validThrough: '2028-12-31',
      status: outcome === 'require_manual_review' ? 'expired' : 'passed',
    },
    kitchenHygieneAudit: {
      score: outcome === 'fail_criminal_flag' ? 68 : 98,
      auditor: 'Dr. Ramesh Rao (Lead Inspector, NABL Cert #BLR-881)',
      swabCultureTest: 'negative',
      status: finalStatus === 'verified' ? 'passed' : 'review_required',
    },
    checks: [
      {
        id: 'chk-cctns',
        name: 'Karnataka Police CCTNS Crime Clearance',
        authority: 'Bengaluru City Police Commissionerate',
        status: finalStatus === 'verified' ? 'passed' : finalStatus === 'flagged' ? 'failed' : 'review_required',
        referenceId: `PCC-BLR-${chef.id.slice(-2)}`,
        verifiedAt: finalStatus === 'verified' ? now : undefined,
        notes: outcome === 'fail_criminal_flag'
          ? 'Flagged: Pending address discrepancy check with jurisdictional station.'
          : 'Zero criminal records or pending charges found.',
      },
      {
        id: 'chk-identity',
        name: 'Aadhaar & PAN Biometric Match',
        authority: 'UIDAI & Income Tax Department',
        status: 'passed',
        referenceId: 'KYC-2026-UID-991',
        verifiedAt: now,
        notes: 'Biometric and face-match 99.4% match confirmed.',
      },
      {
        id: 'chk-fssai',
        name: 'FSSAI FoSCoS License Validation',
        authority: 'Food Safety and Standards Authority of India',
        status: outcome === 'require_manual_review' ? 'review_required' : 'passed',
        referenceId: 'FSSAI-LIC-11224',
        verifiedAt: now,
        notes: outcome === 'require_manual_review'
          ? 'Requires renewal paperwork submission.'
          : 'Food handler cert active.',
      },
      {
        id: 'chk-hygiene',
        name: 'Microbial Swab & Health Vetting',
        authority: 'NABL Certified Diagnostics Laboratory',
        status: 'passed',
        referenceId: 'NABL-SWAB-8841',
        verifiedAt: now,
        notes: 'Hygiene culture negative for contaminants.',
      },
    ],
    lastAuditedTimestamp: now,
  };

  return {
    chefId: chef.id,
    chefName: chef.name,
    status: finalStatus,
    passed: finalStatus === 'verified',
    score: overallScore,
    report,
    auditTrail,
  };
}
