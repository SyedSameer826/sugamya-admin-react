import axios from "axios";
import apiPath from "../constants/apiPath";
import useRequest from "./useRequest"
import { Severty, ShowToast } from "../helper/toast";

const useApi = () => {

  const {request} = useRequest()
 
  const getCountry = async({countryData}) => {
    request({
      url: apiPath.country,
      method: "GET",
      onSuccess: (data) => {
        if (data.status) {
          countryData(data.data)
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };

  const getState = async ({stateData, countryId}) => {
  
    request({
      url: apiPath.state + countryId,
      method: "GET",
      onSuccess: (data) => {
        if (data.status) {
          stateData(data.data)
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };

  const getCity = async({cityData, stateId}) => {
  
    request({
      url: apiPath.city + stateId,
      method: "GET",
      onSuccess: (data) => {
        if (data.status) {
          cityData(data.data)
        } else {
          ShowToast(data.message, Severty.ERROR);
        }
      },
      onError: (error) => {
        ShowToast(error.response.data.message, Severty.ERROR);
      },
    });
  };


    return {getCountry, getState, getCity}

};

export default useApi;
