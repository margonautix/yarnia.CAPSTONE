const API_URL = "http://localhost:3000"; // Base URL for your API

// Fetch all stories from the API
export async function fetchAllStories() {
  try {
    const response = await fetch(`${API_URL}/api/stories`); // Use the full URL for the API request
    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Assuming the data is an array of stories
  } catch (error) {
    console.error("Error fetching all stories:", error);
    throw error;
  }
}

// Fetch a single story by its ID
export async function fetchSingleStory(storyId) {
  try {
    const response = await fetch(`${API_URL}/api/stories/${storyId}`); // Use the full URL with the story ID
    if (!response.ok) {
      throw new Error(
        `Failed to fetch story with ID ${storyId}: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data; // Assuming the data is a single story object
  } catch (error) {
    console.error(`Error fetching story with ID ${storyId}:`, error);
    throw error;
  }
}
