import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Stories from "./Components/Stories";
import "./App.css";

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
        </Routes>
      </div>
    </>
  );
}

export default App;
