import React from "react";
import { Navigate } from "react-router-dom";
import Main from "./layout/Main";

import { useAuthContext } from "../context/AuthContext";
const PrivateRoute = ({ children }) => {

  const { userProfile } = useAuthContext()
  let token = localStorage.getItem("token") ? localStorage.getItem("token") : null;

  return token ? (
    <>
      <Main>{children}</Main>
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
