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

    // Check if the response status is in the success range (200-299)
    if (response.ok) {
      const json = await response.json();
      console.log("Registration successful, token:", json.token);

      // Optionally store the token
      localStorage.setItem("token", json.token);

      return json;
    } else {
      // Log the response for more info (may not always be JSON)
      const errorText = await response.text();
      console.error("Registration failed:", errorText);
    }
  } catch (err) {
    console.error("Oops, something went wrong!", err);
  }
}
