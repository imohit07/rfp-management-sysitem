/**
 * Helper script to list all RFPs with their IDs
 * Usage: node list-rfps.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listRfps() {
  try {
    console.log('\n📋 Fetching all RFPs...\n');
    
    const rfps = await prisma.rfp.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        proposals: {
          include: {
            vendor: true
          }
        }
      }
    });
    
    if (rfps.length === 0) {
      console.log('❌ No RFPs found in database.');
      console.log('\n💡 Create an RFP in the UI first!\n');
      process.exit(0);
    }
    
    console.log(`Found ${rfps.length} RFP(s):\n`);
    console.log('═'.repeat(80));
    
    rfps.forEach((rfp, index) => {
      console.log(`\n📄 RFP #${rfp.id}`);
      console.log(`   Title: ${rfp.title}`);
      console.log(`   Status: ${rfp.status}`);
      console.log(`   Budget: ${rfp.budget ? `$${rfp.budget} ${rfp.currency || 'USD'}` : 'Not specified'}`);
      console.log(`   Created: ${new Date(rfp.createdAt).toLocaleString()}`);
      console.log(`   Proposals: ${rfp.proposals.length}`);
      
      if (rfp.proposals.length > 0) {
        console.log(`   Vendors:`);
        rfp.proposals.forEach(p => {
          console.log(`     - ${p.vendor.name}: $${p.totalPrice || 'N/A'} (${p.deliveryDays || '?'} days)`);
        });
      }
      
      console.log('─'.repeat(80));
    });
    
    console.log('\n💡 To add test proposals to an RFP, run:');
    console.log(`   node add-test-proposals.js <RFP_ID>\n`);
    console.log('Example:');
    console.log(`   node add-test-proposals.js ${rfps[0].id}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listRfps();
