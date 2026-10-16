/**
 * [SIMULATION MODE: GOVERNMENT VERIFICATION APIS]
 * Demo government identity verification stubs (UIDAI Aadhaar KYC, FSSAI FoSCoS, Karnataka CCTNS).
 * Backend service interface is defined in server/services/verificationService.ts for real API integration.
 */
import { Chef, ChefVerificationReport, VerificationStatus } from '../types';
import { VerificationSimResult } from './verificationEngine';

export interface MockAadhaarResponse {
  statusCode: number;
  statusText: string;
  txnId: string;
  aadhaarNumberMasked: string;
  nameMatchScore: number;
  biometricMatched: boolean;
  addressState: string;
  mobileLinked: boolean;
  demographicsVerified: boolean;
  latencyMs: number;
  timestamp: string;
}

export interface MockFssaiResponse {
  statusCode: number;
  statusText: string;
  licenseNumber: string;
  licenseStatus: 'ACTIVE_COMPLIANT' | 'EXPIRED' | 'AUDIT_FLAGGED' | 'UNDER_REVIEW';
  category: string;
  validThrough: string;
  hygieneScore: number;
  inspectionPassed: boolean;
  nablAccredited: boolean;
  latencyMs: number;
  timestamp: string;
}

export interface RealTimeVerificationStepEvent {
  step: 'aadhaar_query' | 'aadhaar_complete' | 'fssai_query' | 'fssai_complete' | 'police_cctns' | 'finalizing';
  title: string;
  description: string;
  apiEndpoint: string;
  status: 'loading' | 'success' | 'flagged' | 'error';
  latencyMs?: number;
}

/**
 * Mock UIDAI Aadhaar Verification API
 * Simulates calling https://uidai.gov.in/auth/v3.1/offline-kyc
 */
export async function queryMockAadhaarApi(
  chefName: string,
  scenario: 'pass' | 'fail' | 'pending' = 'pass'
): Promise<MockAadhaarResponse> {
  const delay = Math.floor(350 + Math.random() * 250);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const now = new Date().toISOString();
  if (scenario === 'fail') {
    return {
      statusCode: 422,
      statusText: 'BIOMETRIC_ANOMALY_DETECTED',
      txnId: `UIDAI-TXN-${Date.now()}-ERR`,
      aadhaarNumberMasked: 'XXXX-XXXX-4819',
      nameMatchScore: 54.2,
      biometricMatched: false,
      addressState: 'Karnataka',
      mobileLinked: false,
      demographicsVerified: false,
      latencyMs: delay,
      timestamp: now,
    };
  }

  if (scenario === 'pending') {
    return {
      statusCode: 202,
      statusText: 'KYC_DATA_SYNC_QUEUED',
      txnId: `UIDAI-TXN-${Date.now()}-QUEUED`,
      aadhaarNumberMasked: 'XXXX-XXXX-4819',
      nameMatchScore: 78.5,
      biometricMatched: true,
      addressState: 'Karnataka',
      mobileLinked: true,
      demographicsVerified: false,
      latencyMs: delay,
      timestamp: now,
    };
  }

  return {
    statusCode: 200,
    statusText: 'BIOMETRICS_MATCHED_CLEARED',
    txnId: `UIDAI-TXN-${Date.now()}-AUTH`,
    aadhaarNumberMasked: 'XXXX-XXXX-4819',
    nameMatchScore: 99.4,
    biometricMatched: true,
    addressState: 'Karnataka',
    mobileLinked: true,
    demographicsVerified: true,
    latencyMs: delay,
    timestamp: now,
  };
}

/**
 * Mock FSSAI FoSCoS License Validation API
 * Simulates calling https://foscos.fssai.gov.in/portal/verify-license
 */
export async function queryMockFssaiApi(
  chefId: string,
  scenario: 'pass' | 'fail' | 'pending' = 'pass'
): Promise<MockFssaiResponse> {
  const delay = Math.floor(300 + Math.random() * 200);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const now = new Date().toISOString();
  if (scenario === 'fail') {
    return {
      statusCode: 403,
      statusText: 'HYGIENE_NOTICE_ISSUED',
      licenseNumber: '11226330018492',
      licenseStatus: 'AUDIT_FLAGGED',
      category: 'Category 16 - Food Handler / Home Prep',
      validThrough: '2024-11-30 (Expired)',
      hygieneScore: 42,
      inspectionPassed: false,
      nablAccredited: false,
      latencyMs: delay,
      timestamp: now,
    };
  }

  if (scenario === 'pending') {
    return {
      statusCode: 202,
      statusText: 'ANNUAL_RENEWAL_IN_PROGRESS',
      licenseNumber: '11226330018492',
      licenseStatus: 'UNDER_REVIEW',
      category: 'Category 16 - Food Handler / Home Prep',
      validThrough: '2026-10-30',
      hygieneScore: 68,
      inspectionPassed: true,
      nablAccredited: true,
      latencyMs: delay,
      timestamp: now,
    };
  }

  return {
    statusCode: 200,
    statusText: 'LICENSE_ACTIVE_NABL_CLEARED',
    licenseNumber: '11226330018492',
    licenseStatus: 'ACTIVE_COMPLIANT',
    category: 'Category 16 - Specialized Caterer & Home Chef',
    validThrough: '2028-12-31',
    hygieneScore: 98,
    inspectionPassed: true,
    nablAccredited: true,
    latencyMs: delay,
    timestamp: now,
  };
}

/**
 * Executes a full real-time status check hitting both mock APIs
 * and yields progression events before resolving the updated VerificationSimResult.
 */
export async function executeRealTimeVerificationCheck(
  chef: Chef,
  targetOutcome: 'verified' | 'flagged' | 'pending' | 'unverified' = 'verified',
  onProgress?: (event: RealTimeVerificationStepEvent) => void
): Promise<{
  result: VerificationSimResult;
  aadhaarResponse: MockAadhaarResponse;
  fssaiResponse: MockFssaiResponse;
  totalDurationMs: number;
}> {
  const startTime = Date.now();
  const scenario =
    targetOutcome === 'verified' ? 'pass' : targetOutcome === 'flagged' ? 'fail' : targetOutcome === 'pending' ? 'pending' : 'fail';

  // Step 1: Query UIDAI Aadhaar Gateway
  onProgress?.({
    step: 'aadhaar_query',
    title: 'Connecting to UIDAI Aadhaar Gateway',
    description: 'Sending demographic & biometric verification request to api.uidai.gov.in/v3/kyc...',
    apiEndpoint: 'api.uidai.gov.in/v3/kyc/verify',
    status: 'loading',
  });

  const aadhaarRes = await queryMockAadhaarApi(chef.name, scenario);

  onProgress?.({
    step: 'aadhaar_complete',
    title: `UIDAI Aadhaar: ${aadhaarRes.statusText}`,
    description: `Match Score: ${aadhaarRes.nameMatchScore}% • Biometrics: ${aadhaarRes.biometricMatched ? 'Matched' : 'Mismatch'} • Txn: ${aadhaarRes.txnId}`,
    apiEndpoint: 'api.uidai.gov.in/v3/kyc/verify',
    status: aadhaarRes.statusCode === 200 ? 'success' : aadhaarRes.statusCode === 202 ? 'loading' : 'flagged',
    latencyMs: aadhaarRes.latencyMs,
  });

  // Step 2: Query FSSAI FoSCoS License Registry
  onProgress?.({
    step: 'fssai_query',
    title: 'Connecting to FSSAI FoSCoS Registry',
    description: 'Validating food hygiene certification & NABL testing dossier...',
    apiEndpoint: 'foscos.fssai.gov.in/api/v1/license/validate',
    status: 'loading',
  });

  const fssaiRes = await queryMockFssaiApi(chef.id, scenario);

  onProgress?.({
    step: 'fssai_complete',
    title: `FSSAI FoSCoS: ${fssaiRes.licenseStatus}`,
    description: `Lic #${fssaiRes.licenseNumber} • Score: ${fssaiRes.hygieneScore}/100 • Valid: ${fssaiRes.validThrough}`,
    apiEndpoint: 'foscos.fssai.gov.in/api/v1/license/validate',
    status: fssaiRes.statusCode === 200 ? 'success' : fssaiRes.statusCode === 202 ? 'loading' : 'flagged',
    latencyMs: fssaiRes.latencyMs,
  });

  // Step 3: Fast cross-check Police CCTNS record
  onProgress?.({
    step: 'police_cctns',
    title: 'Cross-Referencing Police CCTNS Records',
    description: 'Checking national inter-state crime tracking network clearance...',
    apiEndpoint: 'cctns.gov.in/v2/national-pcc-verify',
    status: 'loading',
  });

  await new Promise((r) => setTimeout(r, 200));

  const isVerified = targetOutcome === 'verified';
  const finalStatus: VerificationStatus = targetOutcome;
  const overallScore = isVerified ? 98 : targetOutcome === 'pending' ? 65 : 42;
  const now = new Date().toISOString();

  onProgress?.({
    step: 'finalizing',
    title: `Verification Status Updated: ${finalStatus.toUpperCase()}`,
    description: isVerified
      ? 'All government registries cleared. Verified badge updated in UI instantly.'
      : 'Discrepancy registered with audit desk. UI badge updated.',
    apiEndpoint: 'chefpulse.in/api/v1/chef-trust/status',
    status: isVerified ? 'success' : targetOutcome === 'pending' ? 'loading' : 'flagged',
  });

  const updatedReport: ChefVerificationReport = {
    status: finalStatus,
    overallScore,
    verifiedDate: isVerified ? now.split('T')[0] : 'Audit In Review',
    dossierNumber: `IND-KA-${chef.id.replace('chef-', '').toUpperCase()}-2026-LIVE`,
    aadhaarPANVerification: {
      maskedAadhaar: aadhaarRes.aadhaarNumberMasked,
      maskedPAN: 'ABCDE****K',
      status: aadhaarRes.statusCode === 200 ? 'passed' : 'pending',
      nameMatchPercentage: aadhaarRes.nameMatchScore,
      dobVerified: aadhaarRes.demographicsVerified,
    },
    fssaiCertification: {
      licenseNumber: fssaiRes.licenseNumber,
      category: fssaiRes.category,
      validThrough: fssaiRes.validThrough,
      status: fssaiRes.statusCode === 200 ? 'passed' : 'pending',
    },
    karnatakaPolicePCC: {
      reference: `PCC-KA-${Math.floor(100000 + Math.random() * 900000)}`,
      status: isVerified ? 'passed' : targetOutcome === 'flagged' ? 'flagged' : 'pending',
      crimeRecordClear: isVerified,
      jurisdiction: 'Bengaluru Police Commissionerate & CCTNS',
      verifiedAt: now,
    },
    kitchenHygieneAudit: {
      score: fssaiRes.hygieneScore,
      auditor: 'Dr. Ramesh Rao (Lead Inspector, NABL Cert #KA-881)',
      swabCultureTest: isVerified ? 'negative' : 'positive',
      status: isVerified ? 'passed' : 'review_required',
    },
    checks: [
      {
        id: 'chk-aadhaar-live',
        name: 'UIDAI Aadhaar Biometric KYC',
        authority: 'UIDAI Govt of India',
        status: aadhaarRes.statusCode === 200 ? 'passed' : 'in_progress',
        referenceId: aadhaarRes.txnId,
        verifiedAt: aadhaarRes.timestamp,
        notes: `Biometric match score: ${aadhaarRes.nameMatchScore}%. Latency: ${aadhaarRes.latencyMs}ms.`,
      },
      {
        id: 'chk-fssai-live',
        name: 'FSSAI FoSCoS License Registry',
        authority: 'Food Safety and Standards Authority of India',
        status: fssaiRes.statusCode === 200 ? 'passed' : 'in_progress',
        referenceId: fssaiRes.licenseNumber,
        verifiedAt: fssaiRes.timestamp,
        notes: `Status: ${fssaiRes.licenseStatus}. Category: ${fssaiRes.category}. Hygiene Score: ${fssaiRes.hygieneScore}/100.`,
      },
    ],
    lastAuditedTimestamp: now,
  };

  const simResult: VerificationSimResult = {
    chefId: chef.id,
    chefName: chef.name,
    status: finalStatus,
    passed: isVerified,
    score: overallScore,
    report: updatedReport,
    auditTrail: [
      {
        step: 'Aadhaar Biometric KYC',
        authority: 'UIDAI',
        timestamp: aadhaarRes.timestamp,
        status: aadhaarRes.statusCode === 200 ? 'ok' : 'flagged',
        message: `Txn: ${aadhaarRes.txnId} • Match: ${aadhaarRes.nameMatchScore}%`,
      },
      {
        step: 'FSSAI License Validation',
        authority: 'FSSAI FoSCoS',
        timestamp: fssaiRes.timestamp,
        status: fssaiRes.statusCode === 200 ? 'ok' : 'flagged',
        message: `License: ${fssaiRes.licenseNumber} • Score: ${fssaiRes.hygieneScore}/100`,
      },
    ],
  };

  return {
    result: simResult,
    aadhaarResponse: aadhaarRes,
    fssaiResponse: fssaiRes,
    totalDurationMs: Date.now() - startTime,
  };
}
