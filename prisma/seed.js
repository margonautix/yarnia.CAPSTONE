const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

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
        role: "ADMIN", // Adding role for administrators
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
        role: "USER", // Regular user
      },
    });

    // Each user creates between 1 and 5 stories
    for (let j = 0; j < faker.datatype.number({ min: 1, max: 5 }); j++) {
      const story = await prisma.story.create({
        data: {
          title: faker.lorem.words(3),
          content: faker.lorem.paragraphs(3),
          summary: faker.lorem.sentence(),
          authorId: user.id,
          createdAt: faker.date.past(),
          isBookmarked: faker.datatype.boolean(), // Random boolean for bookmarks
        },
      });

      // Create random comments for each story
      for (let k = 0; k < faker.datatype.number({ min: 0, max: 5 }); k++) {
        await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
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
