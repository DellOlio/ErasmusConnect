import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "./api";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(function () {
    getUser(id)
      .then(setUser)
      .catch(function (err) { setError(err.message); });
  }, [id]);

  if (error) return <div className="error">{error}</div>;
  if (!user) return <p>Ucitavanje...</p>;

  return (
    <div className="box">
      <div className="post-header">
        {user.profile_image_url ? (
          <div className="avatar avatar-big"><img src={user.profile_image_url} alt="" /></div>
        ) : (
          <div className="avatar avatar-big">{user.name.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <h1>{user.name}</h1>
          <p>{user.city}{user.country ? ", " + user.country : ""}</p>
          {user.faculty && <p>{user.faculty}</p>}
        </div>
      </div>
      {user.bio && <p>{user.bio}</p>}
      {user.interests && user.interests.map(function (tag) {
        return <span key={tag} className="tag">{tag}</span>;
      })}
    </div>
  );
}
