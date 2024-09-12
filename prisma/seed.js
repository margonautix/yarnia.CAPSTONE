const prisma = require("../prisma");
const { generateMersenne53Randomizer } = require("@faker-js/faker");
const { faker } = require("@faker-js/faker");

// Initialize the randomizer
const randomizer = generateMersenne53Randomizer();

const seed = async () => {
  // Create 10 random players
  for (let i = 0; i < 10; i++) {
    await prisma.player.create({
      data: {
        // Generate a random player name and score
        name: faker.name.firstName(), // Random first name
        score: Math.floor(randomizer() * 100), // Random score between 0 and 100
      },
    });
  }
};

seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
