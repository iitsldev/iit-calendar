async function test() {
  console.log('Starting OTA API Verification Tests...');

  // Test Case 1: Native build is 1.0.0, current OTA is builtin.
  // Expected: Should upgrade to the latest 1.0.x version (which is 1.0.15 on GitHub).
  console.log('\n--- Test Case 1: Native 1.0.0, OTA builtin ---');
  try {
    const res = await fetch('http://localhost:3001/api/update', {
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
    const res = await fetch('http://localhost:3001/api/update', {
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
    const res = await fetch('http://localhost:3001/api/update', {
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
    const res = await fetch('http://localhost:3001/api/download?version=1.0.15');
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
    console.log('Cache-Control:', res.headers.get('cache-control'));
    
    const buffer = await res.arrayBuffer();
    console.log('Downloaded Size:', buffer.byteLength, 'bytes');
    console.log('Time taken (first run, should download from GitHub):', Date.now() - start, 'ms');

    // Run again to verify caching
    const start2 = Date.now();
    const res2 = await fetch('http://localhost:3001/api/download?version=1.0.15');
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
}

test();
