import { execSync } from 'child_process';
import path from 'path';

console.log('Initiating ChefPulse Android APK Build pipeline...');

try {
  execSync('bash scripts/build-apk.sh', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('ChefPulse Android APK generated successfully in project files.');
} catch (error) {
  console.error('Failed to generate APK:', error);
  process.exit(1);
}
