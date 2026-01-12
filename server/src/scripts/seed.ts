import { connectDB } from '../config/db';
import { DepotModel } from '../models/Depot';
import { VehicleModel } from '../models/Vehicle';
import { OrderModel } from '../models/Order';
import { UserModel } from '../models/user.model';

async function run() {
  await connectDB();
  await Promise.all([
    DepotModel.deleteMany({}),
    VehicleModel.deleteMany({}),
    OrderModel.deleteMany({}),
    UserModel.deleteMany({})
  ]);

  const admin = await UserModel.create({ name: 'Admin', email: 'admin@logi.dev', password: 'admin123', role: 'admin' });
  await UserModel.create({ name: 'Planner', email: 'planner@logi.dev', password: 'planner123', role: 'planner' });
  await UserModel.create({ name: 'Driver One', email: 'driver@logi.dev', password: 'driver123', role: 'driver' });

  const hq = await DepotModel.create({
    name: 'HQ',
    isHQ: true,
    address: 'HQ Depot',
    location: { type: 'Point', coordinates: [4.895168, 52.370216] } // Амстердам центр (пример)
  });

  const v1 = await VehicleModel.create({
    code: 'TRK-001', depot: hq._id, cls: 'truck',
    capacityKg: 5000, capacityM3: 20, speedKph: 45, fixedCost: 100, costPerKm: 0.7,
    workStartMin: 480, workEndMin: 1080
  });

  const v2 = await VehicleModel.create({
    code: 'VAN-101', depot: hq._id, cls: 'van',
    capacityKg: 1200, capacityM3: 8, speedKph: 50, fixedCost: 60, costPerKm: 0.5,
    workStartMin: 480, workEndMin: 1080
  });

  const date = '2025-11-08';

  const pts = [
    { ref: 'ORD-001', addr: 'Point A', coords: [4.915, 52.37], kg: 300, m3: 2, tw: [600, 780] },
    { ref: 'ORD-002', addr: 'Point B', coords: [4.84, 52.39], kg: 800, m3: 4, tw: [540, 900] },
    { ref: 'ORD-003', addr: 'Point C', coords: [4.98, 52.33], kg: 1200, m3: 6, tw: [720, 1000] },
    { ref: 'ORD-004', addr: 'Point D', coords: [4.86, 52.36], kg: 200, m3: 1, tw: [600, 840] },
    { ref: 'ORD-005', addr: 'Point E', coords: [4.93, 52.38], kg: 600, m3: 3, tw: [660, 960] }
  ];

  for (const p of pts) {
    await OrderModel.create({
      ref: p.ref,
      address: p.addr,
      location: { type: 'Point', coordinates: p.coords as any },
      demandKg: p.kg,
      demandM3: p.m3,
      serviceTimeMin: 10,
      twStartMin: p.tw[0],
      twEndMin: p.tw[1],
      date
    });
  }

  console.log('Seed OK. Admin:', admin.email);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
