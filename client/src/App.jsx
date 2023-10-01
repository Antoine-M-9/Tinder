import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { useCookies } from "react-cookie";
import Dashboard from "./pages/Dashboard";
import OnBoarding from "./pages/OnBoarding";

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const authToken = cookies.AuthToken;

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          {authToken && (
            <Route path="/dashboard" element={<Dashboard />}></Route>
          )}
          {authToken && (
            <Route path="/onboarding" element={<OnBoarding />}></Route>
          )}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
