import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Stories from "./Components/Stories";
import "./App.css";
import Stories from "./Components/Stories";
import SingleStory from "./components/SingleStory";

function App() {
  const [searchParams, setSearchParams] = useState("");

  return (
    <>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <Stories
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            }
          />
          <Route path="books/:id" element={<SingleStory />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
