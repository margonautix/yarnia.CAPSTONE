// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import {
//   fetchSingleStory,
//   updateStoryContent,
//   fetchWithAuth,
//   fetchCommentsForStory,
// } from "../API"; // Adjust the API import path as necessary

// export default function SingleStory() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [isCommentsOpen, setIsCommentsOpen] = useState(false); // State for comments dropdown
//   const { storyId } = useParams();
//   const [story, setStory] = useState(null); // Holds the entire story
//   const [content, setContent] = useState(""); // Holds the content being edited
//   const [comments, setComments] = useState([]); // Holds comments for the story
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null); // Holds the authenticated user

//   // Fetch authenticated user when the component mounts
//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         const response = await fetchWithAuth("http://localhost:3000/api/auth/me");
//         if (response.ok) {
//           const userData = await response.json();
//           setUser(userData); // Set the authenticated user
//         } else {
//           setError("Failed to authenticate user.");
//         }
//       } catch (error) {
//         setError("Failed to fetch authenticated user.");
//       }
//     }

//     fetchUser();
//   }, []);

//   // Fetch the story and its comments when the component mounts
//   useEffect(() => {
//     async function fetchStory(storyId) {
//       try {
//         const response = await fetchSingleStory(storyId);
//         if (response) {
//           setStory(response); // Set the story
//           setContent(response.content); // Set the content for editing
          
//           // Fetch comments for the story
//           const commentsResponse = await fetchCommentsForStory(storyId);
//           setComments(commentsResponse); // Set the comments
//         } else {
//           setError("Story not found.");
//         }
//       } catch (error) {
//         setError("Failed to fetch the story or comments.");
//       }
//     }

//     if (storyId) {
//       fetchStory(storyId);
//     } else {
//       setError("No story ID provided.");
//     }
//   }, [storyId]);

//   // Function to handle saving changes
//   const handleSave = async () => {
//     if (story) {
//       try {
//         // Update the story content on the backend
//         await updateStoryContent(storyId, content);

//         // Update the local state with the new content
//         setStory({ ...story, content }); // This will update the UI
//         setIsEditing(false); // Exit editing mode
//       } catch (error) {
//         setError("Failed to update the story content.");
//       }
//     }
//   };

//   // Check if the authenticated user is the author or an admin
//   const canEdit = () => {
//     return user && (user.username === story?.author || user.role === "admin");
//   };

//   const toggleComments = () => {
//     setIsCommentsOpen(!isCommentsOpen); // Toggle comments dropdown
//   };

//   if (error) return <div>{error}</div>;
//   if (!story) return <div>Loading...</div>;

//   return (
//     <div className="story-container">
//       <main>
//         <ul className="story-single">
//           <h2>{story.title || "No Title"}</h2>
//           <h4>Author: {story.author || "Unknown Author"}</h4>
//           <h4>Description: {story.summary || "No Description"}</h4>
//           <p>
//             {isEditing ? (
//               <textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)} // Update content as you type
//                 rows="10" // Set initial height for the textarea
//               />
//             ) : (
//               story.content || "No Content"
//             )}
//           </p>

//           {/* Only show edit button if user is the author or admin */}
//           {canEdit() &&
//             (isEditing ? (
//               <button onClick={handleSave}>Save</button>
//             ) : (
//               <button onClick={() => setIsEditing(true)}>Edit</button>
//             ))}
          
//           {/* Dropdown for comments */}
//           <h2 onClick={toggleComments} style={{ cursor: 'pointer', color: 'blue' }}>
//             {isCommentsOpen ? 'Hide Comments' : `Show Comments (${comments.length})`}
//           </h2>
//           {isCommentsOpen && (
//             <div>
//               {comments.length > 0 ? (
//                 <ul>
//                   {comments.map((comment) => (
//                     <li key={comment.id}>
//                       <strong>{comment.author}</strong>: {comment.text}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>No comments yet.</p>
//               )}
//             </div>
//           )}
//         </ul>
//       </main>
//     </div>
//   );
// }


import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  fetchWithAuth,
  fetchCommentsForStory,
} from "../API"; // Adjust the API import path as necessary

export default function SingleStory() {
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetchWithAuth("http://localhost:3000/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setError("Failed to authenticate user.");
        }
      } catch {
        setError("Failed to fetch authenticated user.");
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchStory(storyId) {
      setLoading(true);
      try {
        const response = await fetchSingleStory(storyId);
        if (response) {
          setStory(response);
          setContent(response.content);

          // Fetch comments for the story
          const commentsResponse = await fetchCommentsForStory(storyId);
          console.log("Fetched comments:", commentsResponse); // Log to check structure
          setComments(commentsResponse);
        } else {
          setError("Story not found.");
        }
      } catch {
        setError("Failed to fetch the story or comments.");
      } finally {
        setLoading(false);
      }
    }

    if (storyId) {
      fetchStory(storyId);
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]);

  const handleSave = async () => {
    if (story) {
      try {
        await updateStoryContent(storyId, content);
        setStory({ ...story, content });
        setIsEditing(false);
      } catch {
        setError("Failed to update the story content.");
      }
    }
  };

  const canEdit = useMemo(() => {
    return user && (user.username === story.author.username || user.isAdmin);
  }, [user, story]);

  const toggleComments = (e) => {
    e.stopPropagation(); // Prevent any parent click events
    setIsCommentsOpen((prev) => !prev);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!story) return <div>No story found.</div>;

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author.username || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="10"
              />
            ) : (
              story.content || "No Content"
            )}
          </p>

          {canEdit && (
            isEditing ? (
              <button onClick={handleSave}>Save</button>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            )
          )}
          
          <h2 onClick={toggleComments} style={{ cursor: 'pointer', color: 'blue' }}>
            {isCommentsOpen ? 'Hide Comments' : `Show Comments (${comments.length})`}
          </h2>
          {isCommentsOpen && (
            <div className="commentsection">
              {comments.length > 0 ? (
                <ul>
                  {comments.map((comment) => (
                    <li key={comment.commentId}>
                      <strong>{comment.user.username || "Unknown Author"}</strong>: {comment.content || "No Comment Text"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
          )}
        </ul>
      </main>
    </div>
  );
}

