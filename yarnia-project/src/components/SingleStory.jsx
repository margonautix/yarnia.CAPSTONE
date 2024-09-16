import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSingleStory } from "../API";


const SingleStory = ({token}) => {
    const [story, setStory] = useState(null);
    const { storyId } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        async function fetchStory() {
            const response = await fetchSingleStory(storyId);
            setStory(response.story);
        }
        fetchStory();
    }, [storyId])

    return(
        <>
            <div className = "">
                <main className="" key="{}">
                    <h2>{story.title}</h2>
                    <h3>{story.authorId}</h3>
                    <h3>{story.summary}</h3>
                    <button onClick={() => navigate(`/`)}>Return to Story Shelf</button>
                </main>
            </div>
        </>
    )
}
