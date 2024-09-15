import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Stories from "./components/Stories";

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
