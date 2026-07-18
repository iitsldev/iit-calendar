const PORT = process.env.PORT || '3002';
const BASE_URL = `http://localhost:${PORT}`;

async function test() {
  console.log(`Starting OTA API Verification Tests on ${BASE_URL}...`);

  // Test Case 1: Native build is 1.0.0, current OTA is builtin.
  // Expected: Should upgrade to the latest 1.0.x version (which is 1.0.15 on GitHub).
  console.log('\n--- Test Case 1: Native 1.0.0, OTA builtin ---');
  try {
    const res = await fetch(`${BASE_URL}/api/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version_build: '1.0.0',
        version_name: 'builtin'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data.version === '1.0.15' && data.url.includes('/api/download?version=1.0.15')) {
      console.log('✅ Success: Correctly offered upgrade to 1.0.15 with proxy URL');
    } else {
      console.log('❌ Failure: Expected update to 1.0.15');
    }
  } catch (err) {
    console.error('Error in Test Case 1:', err);
  }

  // Test Case 2: Native build is 1.0.15, current OTA is 1.0.15.
  // Expected: Already on the latest patch for major 1, minor 0. Should return {} (no update).
  console.log('\n--- Test Case 2: Native 1.0.15, OTA 1.0.15 ---');
  try {
    const res = await fetch(`${BASE_URL}/api/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version_build: '1.0.15',
        version_name: '1.0.15'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (Object.keys(data).length === 0) {
      console.log('✅ Success: Correctly returned empty response (no update)');
    } else {
      console.log('❌ Failure: Expected empty response');
    }
  } catch (err) {
    console.error('Error in Test Case 2:', err);
  }

  // Test Case 3: Native build is 1.1.1, current OTA is builtin.
  // Expected: Should NOT update to 1.0.15, and if there is no newer 1.1.x, should return {}.
  console.log('\n--- Test Case 3: Native 1.1.1, OTA builtin ---');
  try {
    const res = await fetch(`${BASE_URL}/api/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version_build: '1.1.1',
        version_name: 'builtin'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (Object.keys(data).length === 0) {
      console.log('✅ Success: Correctly returned empty response (minor version mismatch / no 1.1.x updates)');
    } else {
      console.log('❌ Failure: Expected empty response');
    }
  } catch (err) {
    console.error('Error in Test Case 3:', err);
  }

  // Test Case 4: Verify proxy download endpoint for version 1.0.15.
  // Expected: Should serve the ZIP bundle from the proxy with proper headers and cache settings.
  console.log('\n--- Test Case 4: Verify download proxy for 1.0.15 ---');
  try {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/download?version=1.0.15`);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
    console.log('Cache-Control:', res.headers.get('cache-control'));
    
    const buffer = await res.arrayBuffer();
    console.log('Downloaded Size:', buffer.byteLength, 'bytes');
    console.log('Time taken (first run, should download from GitHub):', Date.now() - start, 'ms');

    // Run again to verify caching
    const start2 = Date.now();
    const res2 = await fetch(`${BASE_URL}/api/download?version=1.0.15`);
    const buffer2 = await res2.arrayBuffer();
    const duration2 = Date.now() - start2;
    console.log('\nTime taken (second run, should be served from local cache):', duration2, 'ms');
    if (res2.status === 200 && buffer2.byteLength === buffer.byteLength && duration2 < 100) {
      console.log('✅ Success: Proxy cache hit successfully served the bundle instantly!');
    } else {
      console.log('❌ Failure: Expected fast cache hit response');
    }
  } catch (err) {
    console.error('Error in Test Case 4:', err);
  }

  // Test Case 5: Verify versions listing endpoint.
  // Expected: Should return a sorted list of releases with bundle files.
  console.log('\n--- Test Case 5: Verify versions listing endpoint ---');
  try {
    const res = await fetch(`${BASE_URL}/api/versions`);
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Total Versions Available:', data.length);
    console.log('Newest version:', data[0]?.version);
    console.log('Oldest version:', data[data.length - 1]?.version);

    // Verify ordering
    let isSorted = true;
    for (let i = 0; i < data.length - 1; i++) {
      // Helper function to check if v1 is newer than v2
      function isNewer(v1, v2) {
        const p1 = v1.split('.').map(Number);
        const p2 = v2.split('.').map(Number);
        for (let j = 0; j < 3; j++) {
          if ((p1[j] || 0) !== (p2[j] || 0)) {
            return (p1[j] || 0) > (p2[j] || 0);
          }
        }
        return false;
      }
      if (isNewer(data[i+1].version, data[i].version)) {
        isSorted = false;
        break;
      }
    }
    
    // Check filtering
    const resFilter = await fetch(`${BASE_URL}/api/versions?major=1&minor=0`);
    const dataFilter = await resFilter.json();
    console.log('Filtered Versions (1.0.*):', dataFilter.map(v => v.version));

    const allAreOneDotZero = dataFilter.every(v => v.version.startsWith('1.0.'));

    if (res.status === 200 && isSorted && allAreOneDotZero) {
      console.log('✅ Success: Versions API returned correctly sorted and filterable results!');
    } else {
      console.log('❌ Failure: Versions API response did not meet sorting/filtering expectations');
    }
  } catch (err) {
    console.error('Error in Test Case 5:', err);
  }
}

test();
