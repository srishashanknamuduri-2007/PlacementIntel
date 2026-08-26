import { runPhase1VerificationSuite } from './test-phase1';

runPhase1VerificationSuite().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  if (failed.length > 0) {
    console.error(`\n❌ VERIFICATION FAILED: ${failed.length} criteria failed.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${results.length} ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!`);
    process.exit(0);
  }
});
