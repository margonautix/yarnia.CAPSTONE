import { useEffect, useState } from "react";
import React from "react";
import { fetchAllStories } from "../API";

const Stories = ({ searchParams, setSearchParams }) => {
  const [stories, setStories] = useState([]);
  console.log(stories);

  useEffect(() => {
    async function getAllStories() {
      const response = await fetchAllStories();
      setStories(response.stories);
    }
    getAllStories();
  }, []);

  const storiesToDisplay = searchParams
    ? stories.filter((story) =>
        story.title.toLowerCase().includes(searchParams)
      )
    : stories;

  return (
    <div>
      {storiesToDisplay.map((story) => {
        return <h2>{story.title}</h2>;
      })}
    </div>
  );
};

export default Stories;
