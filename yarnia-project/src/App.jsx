import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Stories from "./Components/Stories"; // Ensure correct case
import SingleStory from "./components/SingleStory";
import CommentsPage from "./components/Comments"; // Import the CommentsPage component
import NavBar from "./components/Navbar"; // Import the NavBar component
import "./App.css";

function App() {
  const [searchParams, setSearchParams] = useState("");

  return (
    <div className="App">
      {/* Navbar always visible */}
      <NavBar />

      <Routes>
        {/* Passing searchParams to the Stories component */}
        <Route
          path="/"
          element={
            <Stories
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          }
        />
        {/* Route for viewing a single story */}
        <Route path="stories/:id" element={<SingleStory />} />

        {/* Admin-only route for viewing all comments */}
        <Route path="/comments" element={<CommentsPage />} />
      </Routes>
    </div>
  );
}

export default App;
