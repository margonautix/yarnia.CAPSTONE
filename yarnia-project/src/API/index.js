const API_URL = "http://localhost:3000/api"; // Base URL for your API

// Fetch all stories from the API
export async function fetchAllStories() {
  try {
    const response = await fetch(`${API_URL}/stories`);
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
    const response = await fetch(`${API_URL}/stories/${storyId}`); // Assuming the API endpoint is `/stories/:id`
    if (!response.ok) {
      throw new Error(`Error fetching story: ${response.statusText}`);
    }
    const data = await response.json(); // Parse the response data
    return data; // Return the data (should include the story object)
  } catch (error) {
    console.error("Error fetching the story:", error);
    throw error;
  }
}

// Fetch all comments from the API
export async function fetchAllComments() {
  try {
    const response = await fetch(`${API_URL}/comments`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Assuming the data is an array of comments
  } catch (error) {
    console.error("Error fetching all comments:", error);
    throw error;
  }
}

// Register a new user
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
      console.log("Registration successful, token:", json.token);
      localStorage.setItem("token", json.token); // Store the token
      return json;
    } else {
      console.error("Registration failed:", json.message);
      return { error: json.message }; // Return the error message for handling
    }
  } catch (err) {
    console.error("Oops, something went wrong during registration!", err);
    throw err; // Rethrow the error for further handling
  }
}

// Log in an existing user
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    return json; // Expect this to return both the user and token
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
}

// Fetch comments for a specific story by its ID
export async function fetchCommentsForStory(storyId) {
  try {
    const response = await fetch(`${API_URL}/stories/${storyId}/comments`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch comments for story ID ${storyId}: ${response.statusText}`
      );
    }
    const data = await response.json(); // Assuming the data is an array of comments
    return data;
  } catch (error) {
    console.error(`Error fetching comments for story ID ${storyId}:`, error);
    throw error;
  }
}

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  return await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    },
  });
}
