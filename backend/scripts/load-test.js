const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const DEFAULT_API_URL = `http://localhost:${PORT}`;

// Read API URL from command line or default to local port
const API_URL = (process.argv[2] || DEFAULT_API_URL).replace(/\/$/, '');
const NUM_REQUESTS = parseInt(process.argv[3], 10) || 50;

// Helper to generate a random 10-digit number
const randomPhone = () => {
  return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
};

const names = [
  'Aarav', 'Ananya', 'Vivaan', 'Diya', 'Aditya', 'Ishaan', 'Kabir', 'Meera', 
  'Neha', 'Rohan', 'Siddharth', 'Varun', 'Kiran', 'Hari', 'Devika', 'Gautham'
];

// Track registered submission IDs for optional cleanup
const createdSubmissionIds = [];

const registerStudent = async (index) => {
  const payload = {
    phoneNumber: randomPhone(),
    groupName: null,
    students: [
      {
        name: `${names[index % names.length]} (Test User ${index})`,
        photoUrl: 'https://res.cloudinary.com/dutxjueyh/image/upload/v1717643567/srishtipass/sample.jpg'
      }
    ]
  };

  const startTime = Date.now();
  try {
    const response = await fetch(`${API_URL}/api/submissions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      if (data.submission && data.submission._id) {
        createdSubmissionIds.push(data.submission._id);
      }
      return { success: true, duration, status: response.status };
    } else {
      return { success: false, duration, status: response.status, message: data.message };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return { success: false, duration, status: 'ERROR', message: error.message };
  }
};

const cleanUpSubmissions = async (adminEmail, adminPassword) => {
  if (createdSubmissionIds.length === 0) {
    console.log('\nNo test submissions were created to clean up.');
    return;
  }

  console.log(`\nStarting cleanup of ${createdSubmissionIds.length} test submissions...`);

  try {
    // 1. Login to get token
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });

    if (!loginRes.ok) {
      const data = await loginRes.json();
      throw new Error(`Admin login failed: ${data.message}`);
    }

    const { accessToken } = await loginRes.json();
    console.log('Logged in successfully as admin. Deleting entries...');

    // 2. Delete each created submission
    let deletedCount = 0;
    for (const id of createdSubmissionIds) {
      const deleteRes = await fetch(`${API_URL}/api/submissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (deleteRes.ok) {
        deletedCount++;
      } else {
        console.warn(`Failed to delete submission with ID: ${id}`);
      }
    }
    console.log(`Cleanup complete! Successfully deleted ${deletedCount}/${createdSubmissionIds.length} test submissions.`);
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  }
};

const runLoadTest = async () => {
  console.log('====================================================');
  console.log(`           SRISHTIPASS LOAD TEST GENERATOR          `);
  console.log('====================================================');
  console.log(`Target API Base URL: ${API_URL}`);
  console.log(`Concurrent Users   : ${NUM_REQUESTS}`);
  console.log('----------------------------------------------------');
  console.log('Executing concurrent registration requests...');

  const startTime = Date.now();
  const promises = [];

  for (let i = 1; i <= NUM_REQUESTS; i++) {
    promises.push(registerStudent(i));
  }

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  // Process results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  
  const total = results.length;
  const successCount = successful.length;
  const failureCount = failed.length;

  const minTime = durations[0] || 0;
  const maxTime = durations[durations.length - 1] || 0;
  const sumTime = durations.reduce((a, b) => a + b, 0);
  const avgTime = sumTime / total || 0;
  const medianTime = durations[Math.floor(durations.length / 2)] || 0;
  
  // Percentiles
  const p90Time = durations[Math.floor(durations.length * 0.9)] || 0;
  const p95Time = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99Time = durations[Math.floor(durations.length * 0.99)] || 0;

  // Group status codes
  const statusCodes = {};
  results.forEach(r => {
    statusCodes[r.status] = (statusCodes[r.status] || 0) + 1;
  });

  console.log('\n====================================================');
  console.log('                  PERFORMANCE STATS                 ');
  console.log('====================================================');
  console.log(`Total Completed Requests : ${total}`);
  console.log(`Success Count            : ${successCount} (${((successCount/total)*100).toFixed(1)}%)`);
  console.log(`Failure Count            : ${failureCount} (${((failureCount/total)*100).toFixed(1)}%)`);
  console.log(`Total Elapsed Time       : ${totalDuration} ms`);
  console.log(`Throughput               : ${((total / totalDuration) * 1000).toFixed(2)} req/sec`);
  console.log('----------------------------------------------------');
  console.log(`Latency - Min            : ${minTime} ms`);
  console.log(`Latency - Max            : ${maxTime} ms`);
  console.log(`Latency - Average        : ${avgTime.toFixed(1)} ms`);
  console.log(`Latency - Median (p50)   : ${medianTime} ms`);
  console.log(`Latency - 90th percentile: ${p90Time} ms`);
  console.log(`Latency - 95th percentile: ${p95Time} ms`);
  console.log(`Latency - 99th percentile: ${p99Time} ms`);
  console.log('----------------------------------------------------');
  console.log('HTTP Status Codes distribution:');
  Object.keys(statusCodes).forEach(code => {
    console.log(`  - Status [${code}]: ${statusCodes[code]} requests`);
  });
  console.log('====================================================');

  if (failed.length > 0) {
    console.log('\nSample Failures:');
    failed.slice(0, 5).forEach((f, idx) => {
      console.log(`  ${idx + 1}. Status [${f.status}]: ${f.message}`);
    });
  }

  // Handle auto-cleanup prompt
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword && successCount > 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nDo you want to delete the created test users from the database? (y/N): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await cleanUpSubmissions(adminEmail, adminPassword);
      } else {
        console.log('\nTest users kept in the database. You can review them in the admin dashboard.');
      }
      rl.close();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

runLoadTest();
