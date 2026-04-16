require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Project  = require('../models/Project');
const Report   = require('../models/Report');
const Material = require('../models/Material');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sitepilot');
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Report.deleteMany({}), Material.deleteMany({})]);

  const [admin, eng1, eng2] = await User.create([
    { name:'Ravi Kumar',   email:'ravi@sitepilot.com',  password:'password123', company:'Kumar Constructions', role:'Admin',         phone:'+91 98765 43210', location:'Hyderabad' },
    { name:'Priya Sharma', email:'priya@sitepilot.com', password:'password123', company:'Kumar Constructions', role:'Site Engineer',  phone:'+91 87654 32109', location:'Bangalore' },
    { name:'Suresh Reddy', email:'suresh@sitepilot.com',password:'password123', company:'Kumar Constructions', role:'Supervisor',     phone:'+91 76543 21098', location:'Anantapur' },
  ]);

  const [p1, p2, p3, p4] = await Project.create([
    { name:'Highway NH-44 Widening',     location:'Bangalore–Chennai', progress:68,  status:'active',    startDate:'2024-01-10', endDate:'2025-06-30', budget:'₹4.2 Cr',  manager:eng1._id, createdBy:admin._id },
    { name:'Commercial Complex Block A', location:'Whitefield, BLR',  progress:35,  status:'active',    startDate:'2024-03-15', endDate:'2025-09-30', budget:'₹8.7 Cr',  manager:eng1._id, createdBy:admin._id },
    { name:'Residential Colony Phase 2', location:'Anantapur, AP',    progress:82,  status:'active',    startDate:'2023-11-01', endDate:'2025-03-31', budget:'₹2.1 Cr',  manager:eng2._id, createdBy:admin._id },
    { name:'Water Treatment Plant Ext.', location:'Vizag, AP',        progress:20,  status:'active',    startDate:'2024-05-01', endDate:'2026-04-30', budget:'₹6.3 Cr',  manager:eng2._id, createdBy:admin._id },
  ]);

  await Report.create([
    { project:p1._id, date:new Date(), workDone:'Foundation pouring Grid B3-B7', workersCount:24, materialsUsed:'40 bags cement', submittedBy:eng1._id },
    { project:p2._id, date:new Date(), workDone:'Steel reinforcement Level 3',   workersCount:16, materialsUsed:'3T TMT bars',    submittedBy:eng1._id },
  ]);

  await Material.create([
    { project:p1._id, name:'Cement (OPC 53)',  quantity:480,  unit:'Bags',   minThreshold:100, supplier:'Ramco Cements', addedBy:eng1._id },
    { project:p1._id, name:'TMT Steel Bars',   quantity:8,    unit:'Tonnes', minThreshold:10,  supplier:'TATA Steel',    addedBy:eng1._id },
    { project:p2._id, name:'River Sand',        quantity:220,  unit:'Cft',    minThreshold:50,  supplier:'Local Quarry',  addedBy:eng1._id },
    { project:p2._id, name:'Coarse Aggregate',  quantity:4,    unit:'Tonnes', minThreshold:8,   supplier:'Apex Agg.',     addedBy:eng1._id },
    { project:p3._id, name:'Bricks (Class A)',  quantity:8400, unit:'Nos',    minThreshold:1000,supplier:'BM Bricks',     addedBy:eng2._id },
    { project:p4._id, name:'PVC Pipes (4")',    quantity:2,    unit:'Rmt',    minThreshold:10,  supplier:'Supreme Pipe',  addedBy:eng2._id },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('Login: ravi@sitepilot.com / password123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });