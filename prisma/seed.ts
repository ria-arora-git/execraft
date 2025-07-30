import { PrismaClient, TableStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find the restaurant by name (not unique field, so use findFirst)
  let restaurant = await prisma.restaurant.findFirst({
    where: { name: 'My Restaurant' }
  })

  // If not found, create
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: { name: 'My Restaurant' }
    })
  }

  const tables = [
    {
      number: 1,
      capacity: 2,
      status: TableStatus.AVAILABLE,
      token: 'tbl_1_123abc',
      restaurantId: restaurant.id,
    },
    {
      number: 2,
      capacity: 4,
      status: TableStatus.AVAILABLE,
      token: 'tbl_2_def456',
      restaurantId: restaurant.id,
    },
    {
      number: 3,
      capacity: 6,
      status: TableStatus.AVAILABLE,
      token: 'tbl_3_ghi789',
      restaurantId: restaurant.id,
    },
  ]

  // Use createMany to insert tables, skipping duplicates
  await prisma.table.createMany({
    data: tables,
    skipDuplicates: true,
  })

  console.log('Database seeded successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
