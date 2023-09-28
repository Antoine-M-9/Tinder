import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from 'react-cookie'

export const MatchesDisplay = ({ matches, setClickedUser }) => {
  const [matchedProfiles, setMatchedProfiles] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const userId = cookies.UserId

  const matchedUserIds = [...new Set(matches.map(({ user_id }) => user_id))];
  // revoir ce que fait cette ligne de code

  const getMatches = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users", {
        params: { userIds: JSON.stringify(matchedUserIds) },
      });
      setMatchedProfiles(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getMatches();
  }, [matches]);

  const filteredMatchesProfiles = matchedProfiles?.filter((matchedProfile) =>
    matchedProfile.matches.filter((profile) => profile.user_id == userId).length > 0
  );

  return (
    <div className="matches-display">
      {filteredMatchesProfiles?.map((match) => (
        <div
          key={match.user_id}
          className="match-card"
          onClick={() => setClickedUser(match)}
        >
          <div className="img-container">
            <img src={match?.url} alt={`${match?.first_name} ' profile`} />
          </div>
          <h3>{match?.first_name}</h3>
        </div>
      ))}
    </div>
  );
};

export default MatchesDisplay;
