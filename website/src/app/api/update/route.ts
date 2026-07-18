import { NextRequest, NextResponse } from 'next/server';
import { fetchReleases, parseSemVer, isNewer, getZipBundle } from '@/lib/ota';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { version_build, version_name } = body;
    console.log('👉 Capgo Update Request:', { version_build, version_name });

    if (!version_build) {
      return NextResponse.json({ error: 'Missing version_build parameter' }, { status: 400 });
    }

    const parsedNative = parseSemVer(version_build);
    // If version_name is not provided or is 'builtin', fallback to version_build as the active baseline
    const currentVersion = !version_name || version_name === 'builtin' ? version_build : version_name;

    // Fetch releases from GitHub
    const releases = await fetchReleases();

    // Filter releases where major and minor match the native binary
    // and check that it has the required asset (web-build.zip)
    const matchingReleases = releases
      .map(release => {
        const parsedRel = parseSemVer(release.tag_name);
        const asset = release.assets.find(a => a.name === 'web-build.zip');
        return {
          release,
          parsedRel,
          asset
        };
      })
      .filter(({ parsedRel, asset }) => {
        return (
          !!asset &&
          parsedRel.major === parsedNative.major &&
          parsedRel.minor === parsedNative.minor
        );
      });

    if (matchingReleases.length === 0) {
      // No updates for this native baseline
      return NextResponse.json({});
    }

    // Sort matching releases descending by version code
    matchingReleases.sort((a, b) => {
      if (isNewer(a.parsedRel.clean, b.parsedRel.clean)) return -1;
      if (isNewer(b.parsedRel.clean, a.parsedRel.clean)) return 1;
      return 0;
    });

    const latestMatch = matchingReleases[0];

    // Check if the latest matching release is strictly newer than the client's current OTA bundle version
    if (isNewer(latestMatch.parsedRel.clean, currentVersion)) {
      // Generate the download proxy URL pointing to our Next.js download endpoint
      const baseUrl = request.nextUrl.origin;
      const downloadUrl = `${baseUrl}/api/download?version=${latestMatch.parsedRel.clean}`;

      // Extract sha256 checksum from the digest field, or compute it on the fly if missing!
      let checksum = latestMatch.asset!.digest
        ? latestMatch.asset!.digest.replace(/^sha256:/i, '')
        : '';

      if (!checksum) {
        // Fallback: download, compute, and cache it on the fly!
        const bundle = await getZipBundle(latestMatch.parsedRel.clean);
        checksum = bundle.sha256;
      }

      const responsePayload = {
        version: latestMatch.parsedRel.clean,
        url: downloadUrl,
        checksum: checksum,
      };
      console.log('👈 Capgo Update Response:', responsePayload);
      return NextResponse.json(responsePayload);
    }

    // Already on the latest version or no newer matching version
    console.log('👈 Capgo Update Response: {} (Up to date)');
    return NextResponse.json({});
  } catch (error: any) {
    console.error('Update API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

