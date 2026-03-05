import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. 카테고리 데이터
  const categories = [
    { id: 1, name: "사람 관계" },
    { id: 2, name: "금전 문제" },
    { id: 3, name: "건강 및 생활" },
    { id: 4, name: "공부 및 진로" },
    { id: 5, name: "자아실현" },
    { id: 6, name: "기타" },
  ];

  console.log("Seeding categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name },
      create: { id: category.id, name: category.name },
    });
  }

  // 2. 스시 종류 데이터
  const sushiTypes = [
    { id: 1, name: "계란초밥" },
    { id: 2, name: "연어초밥" },
    { id: 3, name: "새우초밥" },
    { id: 4, name: "한치초밥" },
    { id: 5, name: "문어초밥" },
    { id: 6, name: "장어초밥" },
    { id: 7, name: "와규초밥" },
    { id: 8, name: "가리비초밥" },
    { id: 9, name: "광어초밥" },
    { id: 10, name: "성게알초밥" },
    { id: 11, name: "참치초밥" },
    { id: 12, name: "연어알초밥" },
  ];

  console.log("Seeding sushi types...");
  for (const sushiType of sushiTypes) {
    await prisma.sushiType.upsert({
      where: { id: sushiType.id },
      update: { name: sushiType.name },
      create: { id: sushiType.id, name: sushiType.name },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
