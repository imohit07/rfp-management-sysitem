/**
 * Script to directly add test proposals to an RFP
 * Bypasses email for quick testing of AI comparison
 * 
 * Usage: node add-test-proposals.js <rfp_id>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testProposals = [
  {
    vendorName: "Acme Corp",
    totalPrice: 75000,
    currency: "USD",
    deliveryDays: 25,
    aiSummary: "Competitive pricing with Dell Latitude 5420 laptops. Good delivery time. Standard warranty.",
    parsedJson: {
      totalPrice: 75000,
      currency: "USD",
      deliveryDays: 25,
      paymentTerms: "Net 30",
      warranty: "1 year full warranty",
      lineItems: [
        {
          name: "Dell Latitude 5420",
          quantity: 100,
          unitPrice: 750,
          totalPrice: 75000,
          notes: "Intel Core i5, 16GB RAM, 512GB SSD"
        }
      ],
      summary: "Competitive pricing with Dell Latitude 5420 laptops. Good delivery time. Standard warranty."
    }
  },
  {
    vendorName: "Tech Solutions",
    totalPrice: 82000,
    currency: "USD",
    deliveryDays: 20,
    aiSummary: "Premium HP EliteBook offering. Faster delivery. Extended 2-year warranty with premium support.",
    parsedJson: {
      totalPrice: 82000,
      currency: "USD",
      deliveryDays: 20,
      paymentTerms: "Net 45",
      warranty: "2 years comprehensive",
      lineItems: [
        {
          name: "HP EliteBook",
          quantity: 100,
          unitPrice: 820,
          totalPrice: 82000,
          notes: "Intel Core i7, 16GB RAM, 512GB SSD, Premium support"
        }
      ],
      summary: "Premium HP EliteBook offering. Faster delivery. Extended 2-year warranty with premium support."
    }
  },
  {
    vendorName: "Global Systems",
    totalPrice: 70000,
    currency: "USD",
    deliveryDays: 35,
    aiSummary: "Lowest price with Lenovo ThinkPad. Longer delivery time. Standard warranty.",
    parsedJson: {
      totalPrice: 70000,
      currency: "USD",
      deliveryDays: 35,
      paymentTerms: "Net 60",
      warranty: "1 year standard",
      lineItems: [
        {
          name: "Lenovo ThinkPad",
          quantity: 100,
          unitPrice: 700,
          totalPrice: 70000,
          notes: "Intel Core i5, 16GB RAM, 512GB SSD"
        }
      ],
      summary: "Lowest price with Lenovo ThinkPad. Longer delivery time. Standard warranty."
    }
  },
  {
    vendorName: "Prime Technologies",
    totalPrice: 78000,
    currency: "USD",
    deliveryDays: 22,
    aiSummary: "Mid-range pricing with Apple MacBook. Fast delivery. Premium build quality with 2-year AppleCare.",
    parsedJson: {
      totalPrice: 78000,
      currency: "USD",
      deliveryDays: 22,
      paymentTerms: "Net 30",
      warranty: "2 years AppleCare+",
      lineItems: [
        {
          name: "MacBook Air M2",
          quantity: 100,
          unitPrice: 780,
          totalPrice: 78000,
          notes: "Apple M2 chip, 16GB unified memory, 512GB SSD"
        }
      ],
      summary: "Mid-range pricing with Apple MacBook. Fast delivery. Premium build quality with 2-year AppleCare."
    }
  }
];

async function addTestProposals(rfpId) {
  try {
    console.log(`\n🔍 Checking RFP #${rfpId}...`);
    
    // Check if RFP exists
    const rfp = await prisma.rfp.findUnique({
      where: { id: rfpId }
    });
    
    if (!rfp) {
      console.error(`❌ RFP #${rfpId} not found!`);
      process.exit(1);
    }
    
    console.log(`✅ Found RFP: "${rfp.title}"`);
    
    // Get all vendors
    const vendors = await prisma.vendor.findMany();
    
    if (vendors.length < 3) {
      console.error(`❌ Need at least 3 vendors in database. Currently have ${vendors.length}.`);
      console.log('\n💡 Create vendors in the UI first!');
      process.exit(1);
    }
    
    const proposalCount = Math.min(testProposals.length, vendors.length);
    console.log(`\n📋 Found ${vendors.length} vendors. Adding ${proposalCount} proposals...\n`);
    
    // Add proposals
    for (let i = 0; i < Math.min(testProposals.length, vendors.length); i++) {
      const vendor = vendors[i];
      const proposalData = testProposals[i];
      
      // Check if proposal already exists
      const existing = await prisma.proposal.findFirst({
        where: {
          rfpId: rfpId,
          vendorId: vendor.id
        }
      });
      
      if (existing) {
        console.log(`⚠️  Proposal from ${vendor.name} already exists, skipping...`);
        continue;
      }
      
      // Create proposal
      await prisma.proposal.create({
        data: {
          rfpId: rfpId,
          vendorId: vendor.id,
          rawEmail: `Test proposal from ${vendor.name}`,
          parsedJson: JSON.stringify(proposalData.parsedJson),
          totalPrice: proposalData.totalPrice,
          currency: proposalData.currency,
          deliveryDays: proposalData.deliveryDays,
          aiSummary: proposalData.aiSummary
        }
      });
      
      console.log(`✅ Added proposal from ${vendor.name} ($${proposalData.totalPrice}, ${proposalData.deliveryDays} days)`);
    }
    
    console.log(`\n🎉 All test proposals added to RFP #${rfpId}!`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Refresh the UI`);
    console.log(`2. Click "Compare proposals (AI)" button`);
    console.log(`3. See AI recommendation with scores!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get RFP ID from command line
const rfpId = parseInt(process.argv[2]);

if (!rfpId || isNaN(rfpId)) {
  console.log(`
Usage: node add-test-proposals.js <rfp_id>

Example: node add-test-proposals.js 1

This will add 3 test proposals to RFP #1 for quick AI comparison testing.
Make sure you have at least 3 vendors created in the database!
  `);
  process.exit(1);
}

addTestProposals(rfpId);
