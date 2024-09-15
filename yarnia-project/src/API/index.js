const API_URL = "http://localhost:3000";

export async function fetchAllStories() {
  try {
    const response = await fetch(`${API_URL}/api/stories`);
    const json = await response.json();
    return json; // Check if this returns an array directly
  } catch (err) {
    console.error("Uh oh, trouble fetching stories!", err);
  }
}
