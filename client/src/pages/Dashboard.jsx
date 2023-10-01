import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import ChatContainer from "../components/ChatContainer";
import { useCookies } from "react-cookie";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [genderedUsers, setGenderedUsers] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [isSwiping, setIsSwiping] = useState(false);
  const [lastSwipedUserId, setLastSwipedUserId] = useState(null);

  const userId = cookies.UserId;
  const authToken = cookies.AuthToken;

  const getGenderedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/gendered-users", {
        params: { gender: user?.gender_interest },
      });
      setGenderedUsers(response.data);
    } catch (err) {
      console.log(`Error getting gendered users:`, err);
      setError(
        "Une erreur est survenue lors de la récupération des utilisateurs."
      );
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/user", {
          params: { userId }, headers: { 'Authorization': `Bearer ${authToken}`}
        });
        if (!isCancelled) {
          setUser(response.data);
        }
      } catch (err) {
        console.log(err);
        if (!isCancelled)
          setError(
            "Une erreur est survenue lors de la récupération des données utilisateur."
          );
      }
    };

    fetchUser();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) {
      getGenderedUsers();
    }
  }, [user]);

  const updateMatches = async (matchedUserId) => {
    console.log("Sending request");
    try {
      const response = await axios.put("http://localhost:8000/addmatch", {
        userId,
        matchedUserId,
      });
      console.log("Request completed", response);
      setUser((prevUser) => ({
        ...prevUser,
        matches: [...prevUser.matches, { user_id: matchedUserId }],
      }));
    } catch (err) {
      console.log(err);
      setError("Une erreur est survenue lors de la mise à jour des matches.");
    }
  };

  const swiped = async (direction, swipedUserId) => {
    if (isSwiping || swipedUserId === lastSwipedUserId) {
      console.log("Swipe in progress or duplicate swipe, returning");
      return;
    }

    setIsSwiping(true);
    setLastSwipedUserId(swipedUserId);

    if (direction === "right") {
      await updateMatches(swipedUserId);
    }

    setLastDirection(direction);

    // Ajoutez un délai avant de réinitialiser isSwiping
    setTimeout(() => setIsSwiping(false), 2000);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  const matchedUserIds =
    user && user.matches
      ? user.matches.map(({ user_id }) => user_id).concat(userId)
      : [];

  const filteredGenderedUsers = genderedUsers?.filter(
    (genderedUser) => !matchedUserIds.includes(genderedUser.user_id)
  );


  return (
    <>
      {error && <div>{error}</div>}
      {user && (
        <div className="dashboard">
          <ChatContainer user={user} />
          <div className="swipe-container">
            <div className="card-container">
              {filteredGenderedUsers?.map((genderedUser) => (
                <TinderCard
                  className="swipe"
                  key={genderedUser.user_id}
                  onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                  onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}
                >
                  <div
                    style={{ backgroundImage: "url(" + genderedUser.url + ")" }}
                    className="card"
                  >
                    <h3>{genderedUser.first_name}</h3>
                  </div>
                </TinderCard>
              ))}
              <div className="swipe-info">
                {lastDirection ? <p>You swiped {lastDirection}</p> : <p />}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
