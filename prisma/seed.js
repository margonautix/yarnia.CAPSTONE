const prisma = require("../prisma");
const { generateMersenne53Randomizer } = require("@faker-js/faker");
const { faker } = require("@faker-js/faker");

// Initialize the randomizer
const randomizer = generateMersenne53Randomizer();

const seed = async () => {
  // Create 10 random users
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.userName(), // Random username
        email: faker.internet.email(), // Random email
        password: faker.internet.password(), // Random password
        bio: faker.lorem.sentence(), // Random bio
      },
    });

    // Create a random number of stories for each user
    for (let j = 0; j < Math.floor(randomizer() * 5); j++) {
      const story = await prisma.story.create({
        data: {
          title: faker.lorem.words(3), // Random title
          content: faker.lorem.paragraphs(2), // Random story content
          summary: faker.lorem.sentence(), // Random story summary
          authorId: user.id, // Link story to the user
        },
      });

      // Create random comments for the story
      for (let k = 0; k < Math.floor(randomizer() * 5); k++) {
        await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(), // Random comment content
            userId: user.id, // Link comment to the user
            storyId: story.storyId, // Link comment to the story
          },
        });
      }

      // Randomly bookmark stories
      if (Math.random() > 0.5) {
        // 50% chance to bookmark the story
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            storyId: story.storyId,
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
