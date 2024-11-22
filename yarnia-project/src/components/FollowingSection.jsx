import React, { useEffect, useState } from "react";
import { fetchFollowers } from "../API"; // Ensure you export fetchFollowers properly in your API file.

const FollowingSection = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserFollowers = async () => {
      try {
        const data = await fetchFollowers(userId);
        setFollowers(data);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserFollowers();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Following</h3>
      <ul>
        {followers.map((follower) => (
          <li key={follower.id}>{follower.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default FollowingSection;
