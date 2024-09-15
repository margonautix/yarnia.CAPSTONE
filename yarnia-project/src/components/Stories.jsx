import { useEffect, useState } from "react";
import React from "react";
import { fetchAllStories } from "../API";

const Stories = ({ searchParams, setSearchParams }) => {
  const [stories, setStories] = useState([]);
  console.log(stories);

  useEffect(() => {
    async function getAllStories() {
      try {
        const response = await fetchAllStories();
        if (response && Array.isArray(response)) {
          setStories(response); // Assuming the API returns an array directly
        } else {
          console.error("No stories found or response is undefined.");
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
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
