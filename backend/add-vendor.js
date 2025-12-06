/**
 * Script to add a new vendor to the database
 * Usage: node add-vendor.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addVendor() {
  try {
    console.log('\n🔍 Checking existing vendors...\n');
    
    const existingVendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${existingVendors.length} existing vendor(s):`);
    existingVendors.forEach(v => {
      console.log(`  - ${v.name} (${v.email})`);
    });
    
    // New vendor data
    const newVendor = {
      name: "Enterprise Solutions Inc",
      email: "vendor4@test.com",
      phone: "456-789-0123"
    };
    
    console.log(`\n➕ Adding new vendor: ${newVendor.name}...`);
    
    // Check if vendor with this email already exists
    const existing = await prisma.vendor.findUnique({
      where: { email: newVendor.email }
    });
    
    if (existing) {
      console.log(`⚠️  Vendor with email ${newVendor.email} already exists!`);
      console.log(`   Name: ${existing.name}`);
      process.exit(0);
    }
    
    // Create the vendor
    const vendor = await prisma.vendor.create({
      data: newVendor
    });
    
    console.log(`✅ Successfully added vendor #${vendor.id}: ${vendor.name}`);
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Phone: ${vendor.phone}\n`);
    
    // List all vendors
    const allVendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📋 Total vendors in database: ${allVendors.length}\n`);
    allVendors.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name} (${v.email}) - ID: ${v.id}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addVendor();
