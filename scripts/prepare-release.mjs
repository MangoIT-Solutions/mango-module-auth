import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');
const validReleaseTypes = new Set(['patch', 'minor', 'major']);
const validSeedModes = new Set(['none', 'safe', 'manual']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function bumpVersion(version, releaseType) {
  const match = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  if (releaseType === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (releaseType === 'minor') return `${major}.${minor + 1}.0`;
  return `${major + 1}.0.0`;
}

function syncPackageLockVersion(newVersion) {
  if (!fs.existsSync(packageLockPath)) return;
  const packageLock = readJson(packageLockPath);
  packageLock.version = newVersion;
  if (packageLock.packages?.['']) {
    packageLock.packages[''].version = newVersion;
  }
  fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
}

const releaseType = String(process.env.RELEASE_TYPE || '').trim();
const seedMode = String(process.env.SEED_MODE || 'none').trim();

if (!releaseType) {
  console.log('No PR release metadata found. Skipping release preparation.');
  process.exit(0);
}

const packageJson = readJson(packageJsonPath);

if (!validReleaseTypes.has(releaseType)) {
  throw new Error(`Invalid releaseType from PR description: ${releaseType}`);
}

if (!validSeedModes.has(seedMode)) {
  throw new Error(`Invalid seedMode from PR description: ${seedMode}`);
}

const newVersion = bumpVersion(packageJson.version, releaseType);
packageJson.version = newVersion;
packageJson.mangoRelease = {
  migrationRequired: String(process.env.MIGRATION_REQUIRED || 'false').trim().toLowerCase() === 'true',
  seedMode,
  notes: typeof process.env.RELEASE_NOTES === 'string' ? process.env.RELEASE_NOTES : '',
};

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
syncPackageLockVersion(newVersion);

console.log(`Prepared ${packageJson.name}@${newVersion}`);
