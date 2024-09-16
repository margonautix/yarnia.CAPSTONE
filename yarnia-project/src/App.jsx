import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Stories from "./Components/Stories"; // Correct case for the folder name
import SingleStory from "./components/SingleStory"; // Single import for SingleStory
import "./App.css";

function App() {
  const [searchParams, setSearchParams] = useState("");

  return (
    <>
      <div>
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
        </Routes>
      </div>
    </>
  );
}

export default App;
