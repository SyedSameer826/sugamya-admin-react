import axios from "axios";
import apiPath from "../constants/apiPath";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const client = axios.create({
  baseURL: apiPath.baseURL,
});

const useRequest = () => {
  const { logout } = useContext(AuthContext);
  const { country } = useAppContext();

  const request = async ({
    url,
    method: tmethod,
    data,
    onSuccess,
    onError,
    header,
    onErrorSubmit,
  }) => {
    const method = tmethod.trim().toUpperCase();
    // console.log(method);
    let token = localStorage.getItem("token")
      ? localStorage.getItem("token")
      : "";

    // console.log(token);

    const headers = {
      ...header,
      Authorization: `Bearer ${token}`,
      country_id: country?.country_id ?? '646b2e0f46865f1f65565346'
    };

    try {
      const response = await client({
        url,
        method,
        data,
        headers: { ...headers },
      });

      // console.log(response);

      if (onSuccess) {
        onSuccess(response.data);
      } else {
        console.log(response.data, "response");
        onErrorSubmit(response.data);
      }
      return response.data;
    } catch (err) {
      console.log(err, "Error");
      if (err?.response?.code === "ERR_NETWORK") {
        console.log("ErrorNetwork");
      }
      if (err?.response?.status === 401) {
        logout();
      }
      if (err?.response?.status === 403) {
        logout();
      }
      if (err?.response?.data?.message === "jwt expired") {
        logout();
      }
      if (onError) {
        console.log(err);
        onError(err);
      }
      // throw err;
    }
  };

  return { request };
};

export default useRequest;
