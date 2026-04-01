import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

async function demonstrate() {
  const API_URL = 'http://localhost:3000/v1';
  
  // 1. Login as Refine Admin
  console.log('Logging in...');
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@refine.com',
    password: 'refine123',
    tenantId: 'REFINE'
  });
  
  const token = loginRes.data.data.accessToken;
  const user = loginRes.data.data.user;

  if (!token) {
    throw new Error('Login failed: Token not found in response body.');
  }

  console.log('✅ Logged in successfully. Role:', user.role, 'TenantID:', user.tenantId);

  // 2. Upload refine.csv
  console.log('Uploading refine.csv...');
  const form = new FormData();
  form.append('file', fs.createReadStream('refine.csv'));

  const uploadRes = await axios.post(`${API_URL}/portfolios/upload`, form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': loginRes.data.data.user.tenantId, // Extracting UUID from login response
      'x-tenant-code': 'REFINE'
    }
  });

  console.log('✅ Upload successful. Portfolio ID:', uploadRes.data.data.id);
  console.log('Worker should now pick up the job and process records.');
}

demonstrate().catch(err => {
    console.error('❌ Error during demonstration:', err.response?.data || err.message);
});
