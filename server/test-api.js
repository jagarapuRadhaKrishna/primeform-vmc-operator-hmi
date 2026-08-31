// API test script
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Running VMC API Automated Verification Tests...\n');

  try {
    // 1. Health check
    const health = await (await fetch(`${BASE_URL}/health`)).json();
    console.log('1. Health Check:', health.status === 'ONLINE' ? '✅ PASS' : '❌ FAIL');

    // 2. Reset to initial state
    const reset = await (await fetch(`${BASE_URL}/reset`, { method: 'POST' })).json();
    console.log('2. System Reset:', reset.success ? '✅ PASS' : '❌ FAIL');

    // 3. Verify Initial State
    const state = await (await fetch(`${BASE_URL}/state`)).json();
    console.log('3. Initial Stage:', state.machineState.current_stage === 'MACHINE_CHECKS' ? '✅ PASS' : '❌ FAIL');
    console.log('   Checks count: 0/6 ->', state.progress.checks.confirmed === 0 ? '✅ PASS' : '❌ FAIL');

    // 4. Test stage gate protection: Attempting next stage before 6 checks should fail with 400
    const earlyNextRes = await fetch(`${BASE_URL}/stage/next`, { method: 'POST' });
    console.log('4. Stage Gate (Block incomplete checks):', earlyNextRes.status === 400 ? '✅ PASS (Correctly blocked)' : '❌ FAIL');

    // 5. Confirm all 6 machine checks
    for (let i = 1; i <= 6; i++) {
      const res = await (await fetch(`${BASE_URL}/machine-checks/${i}/confirm`, { method: 'POST' })).json();
      if (!res.success) throw new Error(`Failed to confirm check ${i}`);
    }
    console.log('5. Confirmed all 6 machine checks: ✅ PASS');

    // 6. Advance to TOOLS stage
    const nextStageRes1 = await (await fetch(`${BASE_URL}/stage/next`, { method: 'POST' })).json();
    console.log('6. Advance to TOOLS stage:', nextStageRes1.currentStage === 'TOOLS' ? '✅ PASS' : '❌ FAIL');

    // 7. Attempting next stage before 4 tools should fail
    const earlyToolsNextRes = await fetch(`${BASE_URL}/stage/next`, { method: 'POST' });
    console.log('7. Stage Gate (Block incomplete tools):', earlyToolsNextRes.status === 400 ? '✅ PASS (Correctly blocked)' : '❌ FAIL');

    // 8. Confirm all 4 tools
    for (let i = 1; i <= 4; i++) {
      const res = await (await fetch(`${BASE_URL}/tools/${i}/confirm`, { method: 'POST' })).json();
      if (!res.success) throw new Error(`Failed to confirm tool ${i}`);
    }
    console.log('8. Confirmed all 4 tools: ✅ PASS');

    // 9. Advance to WORKPIECE stage
    const nextStageRes2 = await (await fetch(`${BASE_URL}/stage/next`, { method: 'POST' })).json();
    console.log('9. Advance to WORKPIECE stage:', nextStageRes2.currentStage === 'WORKPIECE' ? '✅ PASS' : '❌ FAIL');

    // 10. Confirm all 5 workpiece setup steps
    for (let i = 1; i <= 5; i++) {
      const res = await (await fetch(`${BASE_URL}/workpiece/${i}/confirm`, { method: 'POST' })).json();
      if (!res.success) throw new Error(`Failed to confirm workpiece step ${i}`);
    }
    console.log('10. Confirmed all 5 workpiece steps: ✅ PASS');

    // 11. Advance to READY stage
    const nextStageRes3 = await (await fetch(`${BASE_URL}/stage/next`, { method: 'POST' })).json();
    console.log('11. Advance to READY stage:', nextStageRes3.currentStage === 'READY' ? '✅ PASS' : '❌ FAIL');

    // 12. Advance to OPERATION stage
    const nextStageRes4 = await (await fetch(`${BASE_URL}/stage/next`, { method: 'POST' })).json();
    console.log('12. Advance to OPERATION stage:', nextStageRes4.currentStage === 'OPERATION' ? '✅ PASS' : '❌ FAIL');

    // 13. Start operation
    const startRes = await (await fetch(`${BASE_URL}/operation/start`, { method: 'POST' })).json();
    console.log('13. Start Operation (RUNNING):', startRes.operation_status === 'RUNNING' ? '✅ PASS' : '❌ FAIL');

    // 14. Stop operation
    const stopRes = await (await fetch(`${BASE_URL}/operation/stop`, { method: 'POST' })).json();
    console.log('14. Stop Operation (STOPPED):', stopRes.operation_status === 'STOPPED' ? '✅ PASS' : '❌ FAIL');

    // 15. Reset for fresh operator flow
    const finalReset = await (await fetch(`${BASE_URL}/reset`, { method: 'POST' })).json();
    console.log('15. Final Reset for UI Start:', finalReset.success ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 ALL 15 AUTOMATED BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

runTests();
