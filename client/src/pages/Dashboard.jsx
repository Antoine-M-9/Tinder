import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import ChatContainer from "../components/ChatContainer";
import { useCookies } from "react-cookie";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [genderedUsers, setGenderedUsers] = useState(null);
  const [lastDirection, setLastDirection] = useState();

  const userId = cookies.UserId;

  const getUser = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user", {
        params: { userId },
      });
      setUser(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getGenderedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/gendered-users", {
        params: { gender: user?.gender_interest },
      });
      setGenderedUsers(response.data);
    } catch (err) {
      console.log(`Error getting gendered users:`, err);
    }
  };

  useEffect(() => {
    getUser();
    // getGenderedUsers();
  }, []); // Dépendances vides signifient que cet effet s'exécute une fois au montage

  useEffect(() => {
    if (user) {
      getGenderedUsers();
    }
  }, [user]); // Cet effet s'exécute chaque fois que 'user' change

  console.log('gendered', genderedUsers);

  const updateMatches = async (matchedUserId) => {
    try {
      await axios.put('http://localhost:8000/addmatch', {
        userId,
        matchedUserId
      })
      getUser()
    } catch (err) {
      console.log(err)
    }
  }

  console.log(user)

  const swiped = (direction, swipedUserId) => {
    if (direction === 'right') {
      updateMatches(swipedUserId)
    }

    setLastDirection(direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  return (
    <>
      {user && (
        <div className="dashboard">
          <ChatContainer user={user} />
          <div className="swipe-container">
            <div className="card-container">
              {genderedUsers?.map((genderedUser) => (
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
