async function test() {
    try {
        const url = 'http://localhost:5000/voice/bbox?minLat=10.65&maxLat=10.85&minLng=106.52&maxLng=106.72&visibility=PUBLIC';
        console.log('Testing url:', url);
        const res = await fetch(url);
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

test();
