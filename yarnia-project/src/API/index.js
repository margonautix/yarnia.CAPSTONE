const API_URL = "http://localhost:3000/api"; // Base URL for your API

export async function fetchAllStories() {
  try {
    const response = await fetch(`${API_URL}/stories`); // Full URL for the API request
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

export async function fetchSingleStory(storyId) {
  try {
    const response = await fetch(`${API_URL}/stories/${storyId}`); // Assuming this endpoint gets a single story
    if (!response.ok) {
      throw new Error(
        `Failed to fetch story with ID ${storyId}: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data; // Make sure the data includes the story, comments, and author if necessary
  } catch (error) {
    console.error(`Error fetching story with ID ${storyId}:`, error);
    throw error;
  }
}

export async function fetchAllComments() {
  try {
    const response = await fetch(`${API_URL}/comments`); // Full URL for the API request

    // Check if the response is not successful (status is not in the range of 200-299)
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    return data; // Assuming the data is an array of comments
  } catch (error) {
    // Log error to the console and rethrow it for further handling
    console.error("Error fetching all comments:", error);
    throw error;
  }
}

export async function createNewUser(username, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    const json = await response.json();

    if (response.ok) {
      // Assuming the token is included in the response
      console.log("Registration successful, token:", json.token);

      // Optionally, store the token in localStorage or state
      localStorage.setItem("token", json.token);

      return json;
    } else {
      console.error("Registration failed:", json.message);
    }
  } catch (err) {
    console.error("Oops, something went wrong!", err);
  }
}

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    return json;
  } catch (err) {
    console.error("Login failed:", err);
  }
}

