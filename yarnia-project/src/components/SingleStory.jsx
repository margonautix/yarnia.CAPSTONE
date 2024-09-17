import {useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSingleStory } from "../API"
// import { fetchSingleStory } from "../API";

export default function SingleStory() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [story, setStory] = useState(null);
    useEffect(() => {
        async function fetchStory() {
            const response = await fetchSingleStory(id);
            console.log(response);
            setStory(response.book);
        }
        fetchStory();
    }, []);
    if (!story) return null;
    return (
        <>
        <div className="sotry-container">
            <main>
                <ul className="story-single">
                    <h2>{story.title}</h2>
                    <h4>Author: {story.author}</h4>
                    <h4>Description: {story.description}</h4>
                    <br />
                    <img src={story.coverimage} alt={story.title} />
                    <br />
                    <button onClick={async () => {
                        await addStory(story.id);
                        navigate("/");
                    }}
                    className="AddStory">
                        Add Story
                    </button>
                </ul>
            </main>
        </div>
        </>
    )
}