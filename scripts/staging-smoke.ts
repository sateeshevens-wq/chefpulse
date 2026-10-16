import process from 'node:process';

const base = (process.env.SMOKE_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('SMOKE_BASE_URL is required. Example: https://staging.example.com');
  process.exit(1);
}

const checks = [
  { path: '/api/health/live', expected: 200 },
  { path: '/api/health/ready', expected: 200 },
  { path: '/api/health', expected: 200 },
  { path: '/api/chefs', expected: 200 },
];

let failed = false;
for (const check of checks) {
  try {
    const response = await fetch(`${base}${check.path}`, {
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: 'application/json' },
    });
    const body = await response.text();
    if (response.status !== check.expected) {
      failed = true;
      console.error(`${check.path}: expected HTTP ${check.expected}, received ${response.status}: ${body.slice(0, 240)}`);
      continue;
    }
    console.log(`${check.path}: OK (${response.status})`);
  } catch (error) {
    failed = true;
    console.error(`${check.path}: request failed (${error instanceof Error ? error.message : 'unknown error'})`);
  }
}

if (failed) process.exit(1);
console.log('ChefPulse staging smoke test PASSED.');
