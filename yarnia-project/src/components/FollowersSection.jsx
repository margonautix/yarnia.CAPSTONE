import React, { useState, useEffect } from 'react';

function FollowersSection() {
    const [followers, setFollowers] = useState([]);  // To store followers
    const [loading, setLoading] = useState(true); // To show loading state

    useEffect(() => {
        // Fetch followers when component mounts
        const fetchFollowers = async () => {
            try {
                const response = await fetch('/api/followers');
                const data = await response.json();
                setFollowers(data);
            } catch (error) {
                console.error("Error fetching followers:", error);
            } finally {
                setLoading(false);  // Set loading to false once the data is fetched
            }
        };

        fetchFollowers();
    }, []); // Empty dependency array means this will run once when the component mounts

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Followers</h2>
            <ul>
                {followers.map(follower => (
                    <li key={follower.id}>
                        <h3>{follower.name}</h3>
                        <p>{follower.username}</p>
                        {/* You can display more follower details here */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FollowersSection;
