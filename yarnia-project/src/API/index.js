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
    const response = await fetch(`${API_URL}/stories/${storyId}`);
    if (!response.ok) {
      throw new Error("Error fetching story");
    }
    const storyData = await response.json();
    return storyData;
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

// Modified fetchWithAuth to correctly handle the request body
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  // Ensure the body is properly stringified if it exists
  const body =
    options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body;

  return await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    },
    body, // Ensure the request body is passed correctly
  });
}

// Update story content function
export const updateStoryContent = async (storyId, content) => {
  try {
    const response = await fetch(`${API_URL}/stories/${storyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ content }), // Make sure this matches what your backend expects
    });

    if (!response.ok) {
      throw new Error("Failed to update the story content");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating story content:", error);
  }
};

// Girl who knows (bookmark stuff)

export const fetchBookmarkedStories = async (userId, token) => {
  console.log(userId)
  try {
    const response = await fetch(`${API_URL}/users/${userId}/bookmarks`, {
      headers: {
        Authorization: `Bearer ${token}` // Include token for authorization
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching bookmarks: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the bookmarked stories
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    throw error; // Re-throw the error for further handling
  }
};

export const bookmarkStory = async (storyId, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/bookmarks/${storyId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ storyId })
  });

  // Check if the response is OK (status in the range 200-299)
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to bookmark the story');
  }

  return response.json(); // Assuming you want to return the response data
};


export const removeBookmark = async (storyId, userId, token) => {
  try {
<<<<<<< HEAD
    const response = await fetch(`${API_URL}/users/${userId}/bookmarks/${storyId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
=======
    const response = await fetch(`${API_URL}/${authorId}/bookmarks/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
>>>>>>> origin
    });

    if (!response.ok) {
      throw new Error("Failed to remove bookmark.");
    }

    const json = await response.json();
    return json; // Return any response data if necessary
  } catch (error) {
<<<<<<< HEAD
    console.error("Failed to remove the bookmark:", error);
    throw error; // Re-throw the error for further handling
=======
    console.error("Failed to remove the bookmark.");
>>>>>>> origin
  }
};


// girl who knows

export const deleteStory = async (storyId) => {
  try {
    const response = await fetch(`/api/stories/${storyId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete story with status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error deleting story:", error);
    throw error;
  }
};
