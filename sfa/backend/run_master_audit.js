async function runMasterAudit() {
  const BASE_URL = 'https://backend.ravishankar-clinic.workers.dev';
  const roles = [
    { role: 'ADMIN', user: 'admin', pass: 'admin' },
    { role: 'OWNER', user: 'SEC_TEST_OWNER', pass: 'TestSec123' },
    { role: 'VP', user: 'SEC_TEST_VP', pass: 'TestSec123' },
    { role: 'NSM', user: 'SEC_TEST_NSM', pass: 'TestSec123' },
    { role: 'ZSM', user: 'SEC_TEST_ZSM', pass: 'TestSec123' },
    { role: 'RSM', user: 'SEC_TEST_RSM', pass: 'TestSec123' },
    { role: 'ASM_A', user: 'SEC_TEST_ASM_A', pass: 'TestSec123' },
    { role: 'MR_A', user: 'SEC_TEST_MR_A', pass: 'TestSec123' },
    { role: 'ASM_B', user: 'SEC_TEST_ASM_B', pass: 'TestSec123' },
    { role: 'MR_B', user: 'SEC_TEST_MR_B', pass: 'TestSec123' }
  ];

  const sessions = {};
  console.log('=== STEP 1: AUTHENTICATING ALL 8 ROLES ===');
  for (const r of roles) {
    const res = await fetch(BASE_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: r.user, password: r.pass })
    });
    if (res.ok) {
      const data = await res.json();
      sessions[r.role] = { token: data.token, user: data.user };
      console.log('✔ Authenticated:', r.role.padEnd(8), '| User:', r.user);
    } else {
      console.log('✖ Failed to authenticate:', r.role, await res.text());
    }
  }

  console.log('\n=== STEP 2: TESTING READ & SERVER-SIDE LIST ACL ===');
  for (const [role, session] of Object.entries(sessions)) {
    const headers = { 'Authorization': 'Bearer ' + session.token, 'X-Financial-Year': '2026-27' };
    const uRes = await fetch(BASE_URL + '/api/data/users', { headers });
    const users = uRes.ok ? await uRes.json() : [];
    
    const hasAlpha = users.some(u => u.hq_id === 'SEC_TEST_HQ_A' || u.user_id?.includes('ALPHA') || u.user_id?.includes('_A'));
    const hasBeta = users.some(u => u.hq_id === 'SEC_TEST_HQ_B' || u.user_id?.includes('BETA') || u.user_id?.includes('_B'));
    
    console.log(`Role ${role.padEnd(8)}: Read Users HTTP ${uRes.status}, Total Visible: ${users.length}, Has Alpha: ${hasAlpha}, Has Beta: ${hasBeta}`);
  }

  console.log('\n=== STEP 3: TESTING SENSITIVE HR MUTATIONS ACROSS ALL ROLES ===');
  for (const [role, session] of Object.entries(sessions)) {
    const headers = { 'Authorization': 'Bearer ' + session.token, 'Content-Type': 'application/json', 'X-Financial-Year': '2026-27' };

    // 1. Employee Create (Attack Attempt)
    const empRes = await fetch(BASE_URL + '/api/data/employees', {
      method: 'POST',
      headers,
      body: JSON.stringify({ emp_code: 'SEC_ATTACK_' + role, first_name: 'Attack', last_name: role, mobile: '90000000' + Math.floor(Math.random()*90+10) })
    });

    // 2. User Create (Attack Attempt)
    const usrRes = await fetch(BASE_URL + '/api/data/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: 'SEC_USR_ATTACK_' + role, role: 'ADMIN' })
    });

    // 3. User Transfer (Attack Attempt)
    const trRes = await fetch(BASE_URL + '/api/users/SEC_TEST_USR_MR_B/transfer', {
      method: 'POST',
      headers,
      body: JSON.stringify({ hqId: 'SEC_TEST_HQ_A' })
    });

    // 4. User Promotion to ADMIN (Attack Attempt)
    const prRes = await fetch(BASE_URL + '/api/users/SEC_TEST_USR_MR_B/promote', {
      method: 'POST',
      headers,
      body: JSON.stringify({ role: 'ADMIN', hqId: 'SEC_TEST_HQ_A' })
    });

    // 5. Geography Create (Attack Attempt)
    const geoRes = await fetch(BASE_URL + '/api/data/hqs', {
      method: 'POST',
      headers,
      body: JSON.stringify({ hq_code: 'HQ_ATT_' + role, hq_name: 'HQ Attack ' + role, state_id: 'SEC_TEST_STATE_A', zone_id: 'SEC_TEST_ZONE_A', hq_type: 'METRO', city: 'Attack City' })
    });

    // 6. DA Rates Manage (Attack Attempt)
    const daRes = await fetch(BASE_URL + '/api/data/da_rates', {
      method: 'POST',
      headers,
      body: JSON.stringify({ role: 'MR', amount: 500, city_type: 'HQ' })
    });

    console.log(`Role ${role.padEnd(8)} | EmpCreate: ${empRes.status} | UsrCreate: ${usrRes.status} | Transfer: ${trRes.status} | Promote: ${prRes.status} | GeoCreate: ${geoRes.status} | DaManage: ${daRes.status}`);
  }

  console.log('\n=== STEP 4: TESTING CROSS-SCOPE & IDOR ATTACKS ===');
  // ASM_A attempting to reset device of ASM_B
  const asmaHeaders = { 'Authorization': 'Bearer ' + sessions.ASM_A.token, 'Content-Type': 'application/json' };
  const idorDev = await fetch(BASE_URL + '/api/users/SEC_TEST_USR_ASM_B/reset-device', { method: 'POST', headers: asmaHeaders });
  console.log('ASM_A -> IDOR Device Reset on ASM_B (Expected 403):', idorDev.status);

  // ASM_A attempting to transfer MR_B (outside hierarchy)
  const idorTrans = await fetch(BASE_URL + '/api/users/SEC_TEST_USR_MR_B/transfer', {
    method: 'POST',
    headers: asmaHeaders,
    body: JSON.stringify({ hqId: 'SEC_TEST_HQ_A' })
  });
  console.log('ASM_A -> Cross-Hierarchy Transfer on MR_B (Expected 403):', idorTrans.status);

  // MR_A attempting to unlock account of Owner
  const mraHeaders = { 'Authorization': 'Bearer ' + sessions.MR_A.token };
  const idorUnlock = await fetch(BASE_URL + '/api/users/SEC_TEST_USR_OWNER/unlock', { method: 'POST', headers: mraHeaders });
  console.log('MR_A -> IDOR Unlock on OWNER (Expected 403):', idorUnlock.status);

  // Financial Year Lock Test on Admin
  const adminHeaders = { 'Authorization': 'Bearer ' + sessions.ADMIN.token, 'Content-Type': 'application/json', 'X-Financial-Year': '2023-24' };
  const fyLock = await fetch(BASE_URL + '/api/data/employees', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ emp_code: 'FY_TEST', first_name: 'Test', last_name: 'Past' })
  });
  console.log('Admin Past FY Lock (Expected 423):', fyLock.status);
}
runMasterAudit();
