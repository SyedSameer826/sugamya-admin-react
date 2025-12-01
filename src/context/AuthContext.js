import React, { createContext, useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShowToast, Severty } from "../helper/toast";
import useRequest from "../hooks/useRequest";
import apiPath from "../constants/apiPath";
import axios from "axios";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState({ token: null });

  const [userProfile, setUserProfile] = useState();

  const fetchUser = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get(apiPath.baseURL + `${apiPath.profile}`, {
        headers,
      });
      setUserProfile(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) return;

    let user = JSON.parse(localStorage.getItem("userProfile"));
    if (user) {
      fetchUser();
      //setUserProfile(user)
    }
    setIsLoggedIn(true);
    setSession({ token: token });
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    // localStorage.setItem('userProfile',JSON.stringify(userProfile))
  }, [userProfile]);

  useEffect(() => {
    if (!isLoggedIn) return;
  }, [isLoggedIn]);

  const login = () => {
    setIsLoggedIn(true);
    return <Navigate to="/dashboard" />;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    setIsLoggedIn(false);
    setSession({ token: null });
    setUserProfile();
    return <Navigate to="/login" />;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        session,
        setSession,
        userProfile,
        setUserProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
