import React, { createContext, useState, useContext } from "react";

import useRequest from "../hooks/useRequest";

export const AppStateContext = createContext();

export const AppContextProvider = ({ children }) => {

  const [pageHeading, setPageHeading] = useState("Heading");

  const [country, setCountry] = useState({
    country_id: undefined,
    currency: undefined
  });

  return (
    <AppStateContext.Provider
      value={{
        pageHeading,
        setPageHeading,
        setCountry,
        country
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppStateContext);
};

