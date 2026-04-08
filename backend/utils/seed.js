require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User     = require('../models/User');
const Project  = require('../models/Project');
const Report   = require('../models/Report');
const Material = require('../models/Material');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sitepilot';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Wipe existing data ────────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Report.deleteMany({}),
      Material.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ─────────────────────────────────────────────────────────────────
    const [admin, engineer1, engineer2] = await User.create([
      {
        name:     'Ravi Kumar',
        email:    'ravi@sitepilot.com',
        password: 'password123',
        company:  'Kumar Constructions Pvt. Ltd.',
        role:     'Admin',
        phone:    '+91 98765 43210',
        location: 'Hyderabad, Telangana',
      },
      {
        name:     'Priya Sharma',
        email:    'priya@sitepilot.com',
        password: 'password123',
        company:  'Kumar Constructions Pvt. Ltd.',
        role:     'Site Engineer',
        phone:    '+91 87654 32109',
        location: 'Bangalore, Karnataka',
      },
      {
        name:     'Suresh Reddy',
        email:    'suresh@sitepilot.com',
        password: 'password123',
        company:  'Kumar Constructions Pvt. Ltd.',
        role:     'Supervisor',
        phone:    '+91 76543 21098',
        location: 'Anantapur, Andhra Pradesh',
      },
    ]);
    console.log('👤 Created 3 users');

    // ── Projects ──────────────────────────────────────────────────────────────
    const [p1, p2, p3, p4] = await Project.create([
      {
        name:        'Highway NH-44 Widening',
        location:    'Bangalore–Chennai Corridor',
        description: 'Widening of NH-44 from 4 lanes to 6 lanes over 45 km stretch.',
        startDate:   new Date('2024-01-10'),
        endDate:     new Date('2025-06-30'),
        budget:      '₹4.2 Crore',
        progress:    68,
        status:      'active',
        manager:     engineer1._id,
        createdBy:   admin._id,
      },
      {
        name:        'Commercial Complex Block A',
        location:    'Whitefield, Bangalore',
        description: 'G+12 commercial complex with basement parking.',
        startDate:   new Date('2024-03-15'),
        endDate:     new Date('2025-09-30'),
        budget:      '₹8.7 Crore',
        progress:    35,
        status:      'active',
        manager:     engineer1._id,
        createdBy:   admin._id,
      },
      {
        name:        'Residential Colony Phase 2',
        location:    'Anantapur, Andhra Pradesh',
        description: '120 duplex villas, Phase 2 of the Sunrise Colony project.',
        startDate:   new Date('2023-11-01'),
        endDate:     new Date('2025-03-31'),
        budget:      '₹2.1 Crore',
        progress:    82,
        status:      'active',
        manager:     engineer2._id,
        createdBy:   admin._id,
      },
      {
        name:        'Water Treatment Plant Extension',
        location:    'Visakhapatnam, Andhra Pradesh',
        description: 'Extension of existing WTP capacity from 10 MLD to 25 MLD.',
        startDate:   new Date('2024-05-01'),
        endDate:     new Date('2026-04-30'),
        budget:      '₹6.3 Crore',
        progress:    20,
        status:      'active',
        manager:     engineer2._id,
        createdBy:   admin._id,
      },
    ]);
    console.log('🏗️  Created 4 projects');

    // ── Daily Reports ─────────────────────────────────────────────────────────
    await Report.create([
      {
        project:      p1._id,
        date:         new Date(),
        workDone:     'Completed foundation pouring for Grid B3 to B7. Concrete mix ratio maintained at 1:1.5:3.',
        workersCount: 24,
        materialsUsed:'40 bags OPC cement, 2.5T sand, 4T aggregate',
        notes:        'Weather was clear. Work progressing on schedule.',
        submittedBy:  engineer1._id,
      },
      {
        project:      p1._id,
        date:         new Date(Date.now() - 86400000),
        workDone:     'Formwork removal and scaffolding setup for Level 2 columns.',
        workersCount: 18,
        materialsUsed:'Plywood shuttering 20 sheets, scaffold pipes 150 Rmt',
        notes:        'Minor delay due to rain in afternoon. Recovered by overtime.',
        submittedBy:  engineer1._id,
      },
      {
        project:      p2._id,
        date:         new Date(),
        workDone:     'Steel reinforcement works for Level 3 slab – Grid A to E completed.',
        workersCount: 16,
        materialsUsed:'3.2T TMT 16mm bars, 1.1T TMT 12mm bars, binding wire 80 kg',
        notes:        'Steel inspection done. Quality team approved.',
        submittedBy:  engineer1._id,
      },
    ]);
    console.log('📋 Created 3 reports');

    // ── Materials ─────────────────────────────────────────────────────────────
    await Material.create([
      { project: p1._id, name: 'Cement (OPC 53)',   quantity: 480,  unit: 'Bags',   minThreshold: 100, supplier: 'Ramco Cements',      deliveryDate: new Date('2025-01-12'), addedBy: engineer1._id },
      { project: p1._id, name: 'TMT Steel Bars',    quantity: 8,    unit: 'Tonnes', minThreshold: 10,  supplier: 'TATA Steel',          deliveryDate: new Date('2025-01-10'), addedBy: engineer1._id },
      { project: p2._id, name: 'River Sand',        quantity: 220,  unit: 'Cft',    minThreshold: 50,  supplier: 'Local Quarry',        deliveryDate: new Date('2025-01-08'), addedBy: engineer1._id },
      { project: p2._id, name: 'Coarse Aggregate',  quantity: 4,    unit: 'Tonnes', minThreshold: 8,   supplier: 'Apex Aggregates',     deliveryDate: new Date('2025-01-05'), addedBy: engineer1._id },
      { project: p3._id, name: 'Bricks (Class A)',  quantity: 8400, unit: 'Nos',    minThreshold: 1000,supplier: 'BM Bricks',           deliveryDate: new Date('2025-01-14'), addedBy: engineer2._id },
      { project: p3._id, name: 'Fly Ash',           quantity: 60,   unit: 'Bags',   minThreshold: 20,  supplier: 'Fly Ash Corporation', deliveryDate: new Date('2025-01-11'), addedBy: engineer2._id },
      { project: p4._id, name: 'PVC Pipes (4")',    quantity: 2,    unit: 'Rmt',    minThreshold: 10,  supplier: 'Supreme Pipe',        deliveryDate: new Date('2025-01-13'), addedBy: engineer2._id },
      { project: p4._id, name: 'Electrical Cable',  quantity: 180,  unit: 'Meters', minThreshold: 50,  supplier: 'Polycab',             deliveryDate: new Date('2025-01-07'), addedBy: engineer2._id },
    ]);
    console.log('📦 Created 8 material entries');

    console.log('\n✅ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Demo Login Credentials:');
    console.log('   Email:    ravi@sitepilot.com');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();