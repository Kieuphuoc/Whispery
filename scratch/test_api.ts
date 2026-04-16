import axios from 'axios';

async function test() {
    try {
        const url = 'http://localhost:5000/voice/bbox';
        console.log('Testing url:', url);
        const res = await axios.get(url, {
            params: {
                minLat: 10.65,
                maxLat: 10.85,
                minLng: 106.52,
                maxLng: 106.72,
                visibility: 'PUBLIC'
            }
        });
        console.log('Status:', res.status);
        console.log('Data count:', res.data?.data?.length);
    } catch (e: any) {
        console.log('Error status:', e.response?.status);
        console.log('Error data:', JSON.stringify(e.response?.data, null, 2));
    }
}

test();
