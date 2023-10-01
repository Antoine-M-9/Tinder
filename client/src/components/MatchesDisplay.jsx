import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

export const MatchesDisplay = ({ matches, setClickedUser }) => {
  const [matchedProfiles, setMatchedProfiles] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const userId = cookies.UserId;

  const matchedUserIds = matches
    ? [...new Set(matches.map(({ user_id }) => user_id))]
    : [];


  // ({user_id}) syntaxe de décomposition d'objet en js. elle extrait la propriété user_id de chaque objet du tableau.
  // -> user_id  = partie de la fonction fléchée qui spécifie ce qui doit être retourné pour chaque élément du tableau, dans ce cas elle retourne simplement la valeur user_id que nous avons extraite
  // Set est un objet qui stocke des valeurs unique
  // [...] est utilisé pour convertir l'objet Set en un tableau qui contient les ids uniques

  const getMatches = async () => {
    try {
      const response = await axios.get("https://dreamy-dragon-d4017a.netlify.app/users", {
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

  // const filteredMatchedProfiles = matchedProfiles?.filter(
  //   (matchedProfile) =>
  //     matchedProfile.matches.filter((profile) => profile.user_id == userId)
  //       .length > 0
  // );

  const filteredMatchedProfiles = matchedProfiles?.filter((matchedProfile) => {

    // Apply the filter
    const filterResult =
      matchedProfile.matches.filter((profile) => {
        return profile.user_id == userId;
      }).length > 0;

    return filterResult;
  });
  
  return (
    <div className="matches-display">
      {filteredMatchedProfiles?.map((match) => (
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
