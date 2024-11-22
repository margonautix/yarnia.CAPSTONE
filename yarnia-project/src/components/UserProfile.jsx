import React, { useState } from "react";
import FollowingSection from "./FollowingSection";
import FollowButton from "./FollowButton";

const UserProfile = ({ userId, authorId }) => {
  const [refresh, setRefresh] = useState(false);

  const handleFollowChange = () => {
    setRefresh((prev) => !prev); // Trigger re-render of FollowingSection
  };

  return (
    <div>
      <h2>User Profile</h2>
      <FollowButton authorId={authorId} onFollowChange={handleFollowChange} />
      <FollowingSection userId={userId} key={refresh} />
    </div>
  );
};

export default UserProfile;
