#!/usr/bin/env node
// Google Play rejects any upload whose versionCode is not higher than every
// code already published. The highest one live is 1001007 (v1.1.7), so the code
// is derived from the semver: 1.1.19 -> 1001019. Never go back to commit counts.
import {readFileSync} from 'node:fs';

const MIN_VERSION_CODE = 1_001_007;

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = process.argv[2] ?? pkg.version;
const parts = version.split('-')[0].split('.').map(Number);

if (parts.length < 3 || parts.some((n) => !Number.isInteger(n))) {
  console.error(`version-code: invalid semver "${version}"`);
  process.exit(1);
}

const [major, minor, patch] = parts;
const code = major * 1_000_000 + minor * 1_000 + patch;

if (code <= MIN_VERSION_CODE) {
  console.error(
    `version-code: ${version} -> ${code}, which must be greater than the ${MIN_VERSION_CODE} already published on Google Play`,
  );
  process.exit(1);
}

console.log(code);
