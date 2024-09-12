const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

// Custom function to simulate higher probability

const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  // Create 5 administrators
  for (let i = 0; i < 5; i++) {
    await prisma.user.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        joinedOn: faker.date.past(),
      },
    });
  }

  // Create 20 regular users
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        joinedOn: faker.date.past(),
      },
    });

    // Each user creates between 3 and 7 stories (higher chance for more stories)
    for (let j = 0; j < getRandomNumber(3, 7); j++) {
      const story = await prisma.story.create({
        data: {
          title: faker.lorem.words(3),
          content: faker.lorem.paragraphs(3),
          summary: faker.lorem.sentence(),
          authorId: user.id,
          createdAt: faker.date.past(),
        },
      });

      // Create random comments for each story (higher chance for more comments)
      for (let k = 0; k < getRandomNumber(1, 5); k++) {
        await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
            userId: user.id,
            storyId: story.storyId,
            createdAt: faker.date.past(),
          },
        });
      }
      for (let k = 0; k < getRandomNumber(1, 5); k++) {
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            storyId: story.storyId,
            createdAt: faker.date.past(),
          },
        });
      }
    }
  }
};
seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
