import { db, repaymentRecords, repaymentSyncs } from '../libs/drizzle/index.ts';

async function flushRepayments() {
  console.log('Flushing repayment records...');
  const delRecords = await db.delete(repaymentRecords);
  console.log(`Deleted repayment_records`);
  
  const delSyncs = await db.delete(repaymentSyncs);
  console.log(`Deleted repayment_syncs`);
  
  console.log('Done!');
  process.exit(0);
}

flushRepayments().catch(console.error);
