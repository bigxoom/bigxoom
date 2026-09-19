import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CENTRE PASTORAL NOTRE DAME DE FATIMA — demo data (clearly labelled DEMO)...');

  // ---- Room types ----
  const standard = await prisma.roomType.upsert({
    where: { name: 'Standard' },
    update: {},
    create: { name: 'Standard', basePrice: 30000, capacity: 2, description: 'Standard twin/double room' },
  });
  const deluxe = await prisma.roomType.upsert({
    where: { name: 'Deluxe' },
    update: {},
    create: { name: 'Deluxe', basePrice: 45000, capacity: 2, description: 'Deluxe room with garden view' },
  });
  const suite = await prisma.roomType.upsert({
    where: { name: 'Suite' },
    update: {},
    create: { name: 'Suite', basePrice: 70000, capacity: 3, description: 'Suite with sitting area' },
  });

  // ---- 90 rooms across 3 floors ----
  const floors = ['1', '2', '3'];
  const typesByFloor = [standard, deluxe, suite];
  let created = 0;
  for (let f = 0; f < floors.length; f++) {
    for (let n = 1; n <= 30; n++) {
      const number = `${floors[f]}${n.toString().padStart(2, '0')}`;
      await prisma.room.upsert({
        where: { number },
        update: {},
        create: {
          number,
          floor: floors[f],
          building: 'Main Building',
          roomTypeId: typesByFloor[f].id,
          status: 'AVAILABLE',
          features: ['WiFi', 'Hot water', 'TV'],
        },
      });
      created++;
    }
  }
  console.log(`${created} rooms ensured.`);

  // ---- Demo users for every role (password: Fatima@2026) ----
  const passwordHash = await bcrypt.hash('Fatima@2026', 10);
  const roles: { username: string; fullName: string; role: any; department?: string }[] = [
    { username: 'admin', fullName: 'System Administrator', role: 'SUPER_ADMIN' },
    { username: 'manager', fullName: 'General Manager', role: 'GENERAL_MANAGER' },
    { username: 'reception', fullName: 'Reception Desk', role: 'RECEPTIONIST', department: 'Reception' },
    { username: 'cashier', fullName: 'Front Desk Cashier', role: 'CASHIER', department: 'Accounts' },
    { username: 'accountant', fullName: 'Accountant', role: 'ACCOUNTANT', department: 'Accounts' },
    { username: 'waiter', fullName: 'Restaurant Waiter', role: 'WAITER', department: 'Restaurant' },
    { username: 'bar', fullName: 'Bar Staff', role: 'BAR_STAFF', department: 'Bar' },
    { username: 'kitchen', fullName: 'Kitchen Staff', role: 'KITCHEN_STAFF', department: 'Kitchen' },
    { username: 'housekeeping', fullName: 'Housekeeping Staff', role: 'HOUSEKEEPING', department: 'Housekeeping' },
    { username: 'store', fullName: 'Storekeeper', role: 'STOREKEEPER', department: 'Store' },
    { username: 'maintenance', fullName: 'Maintenance Technician', role: 'MAINTENANCE', department: 'Maintenance' },
    { username: 'supervisor', fullName: 'Shift Supervisor', role: 'SUPERVISOR' },
    { username: 'auditor', fullName: 'Internal Auditor', role: 'AUDITOR' },
  ];
  for (const u of roles) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: { ...u, passwordHash },
    });
  }
  console.log('Demo user accounts ensured for every role (password: Fatima@2026).');

  // ---- Menu: restaurant + bar ----
  const restaurantCat = await prisma.menuCategory.create({ data: { name: 'Main Courses', type: 'RESTAURANT' } });
  const barCat = await prisma.menuCategory.create({ data: { name: 'Drinks', type: 'BAR' } });

  // ---- Inventory (created before menu items so recipes can reference it) ----
  const supplier = await prisma.supplier.create({ data: { name: 'Kigali General Suppliers Ltd', phone: '0788000000' } });
  const rice = await prisma.inventoryItem.create({
    data: { name: 'Rice (kg)', category: 'FOOD', unit: 'kg', quantity: 120, minStock: 30, unitCost: 1200, supplierId: supplier.id },
  });
  const chicken = await prisma.inventoryItem.create({
    data: { name: 'Chicken (kg)', category: 'FOOD', unit: 'kg', quantity: 40, minStock: 10, unitCost: 4500, supplierId: supplier.id },
  });
  const primusBottle = await prisma.inventoryItem.create({
    data: { name: 'Primus (bottle)', category: 'DRINKS', unit: 'bottle', quantity: 180, minStock: 48, unitCost: 1200, supplierId: supplier.id },
  });
  const waterBottle = await prisma.inventoryItem.create({
    data: { name: 'Mineral Water (bottle)', category: 'DRINKS', unit: 'bottle', quantity: 150, minStock: 40, unitCost: 400, supplierId: supplier.id },
  });
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Toilet Paper', category: 'GUEST_SUPPLIES', unit: 'roll', quantity: 200, minStock: 50, unitCost: 500, supplierId: supplier.id },
      { name: 'Detergent (L)', category: 'CLEANING', unit: 'litre', quantity: 8, minStock: 10, unitCost: 3000, supplierId: supplier.id },
    ],
  });
  console.log('Demo inventory created.');

  // ---- Menu, with recipes so restaurant/bar sales auto-deduct stock ----
  const chickenDish = await prisma.menuItem.create({
    data: { categoryId: restaurantCat.id, name: 'Grilled Chicken & Chips', price: 6000, trackStock: true },
  });
  await prisma.menuItemRecipeComponent.createMany({
    data: [
      { menuItemId: chickenDish.id, inventoryItemId: chicken.id, quantityPerUnit: 0.35 },
      { menuItemId: chickenDish.id, inventoryItemId: rice.id, quantityPerUnit: 0.1 },
    ],
  });

  const vegRice = await prisma.menuItem.create({
    data: { categoryId: restaurantCat.id, name: 'Vegetable Rice', price: 4500, trackStock: true },
  });
  await prisma.menuItemRecipeComponent.create({
    data: { menuItemId: vegRice.id, inventoryItemId: rice.id, quantityPerUnit: 0.25 },
  });

  await prisma.menuItem.create({ data: { categoryId: restaurantCat.id, name: 'Beef Brochette Platter', price: 7000 } });

  const primusDrink = await prisma.menuItem.create({
    data: { categoryId: barCat.id, name: 'Primus (500ml)', price: 1500, trackStock: true },
  });
  await prisma.menuItemRecipeComponent.create({
    data: { menuItemId: primusDrink.id, inventoryItemId: primusBottle.id, quantityPerUnit: 1 },
  });

  const waterDrink = await prisma.menuItem.create({
    data: { categoryId: barCat.id, name: 'Mineral Water', price: 800, trackStock: true },
  });
  await prisma.menuItemRecipeComponent.create({
    data: { menuItemId: waterDrink.id, inventoryItemId: waterBottle.id, quantityPerUnit: 1 },
  });

  await prisma.menuItem.create({ data: { categoryId: barCat.id, name: 'Fresh Juice', price: 2000 } });

  console.log('Demo menu + recipes created.');

  // ---- Default system settings ----
  await prisma.systemSetting.upsert({
    where: { key: 'allow_negative_stock' },
    update: {},
    create: { key: 'allow_negative_stock', value: 'false' },
  });

  console.log('Seeding complete. All records above are DEMO data — replace before go-live.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
