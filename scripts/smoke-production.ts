import process from 'node:process';

const base = (process.env.SMOKE_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('SMOKE_BASE_URL is required. Example: https://staging-api.example.com');
  process.exit(1);
}

const checks = ['/api/health/live', '/api/health/ready'];
let failed = false;

for (const path of checks) {
  try {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10_000) });
    const body = await response.text();
    if (!response.ok) {
      failed = true;
      console.error(`${path}: HTTP ${response.status} ${body.slice(0, 200)}`);
    } else {
      console.log(`${path}: OK (${response.status})`);
    }
  } catch (error) {
    failed = true;
    console.error(`${path}: request failed (${error instanceof Error ? error.message : 'unknown error'})`);
  }
}

if (failed) process.exit(1);
console.log('ChefPulse deployment smoke test PASSED.');
