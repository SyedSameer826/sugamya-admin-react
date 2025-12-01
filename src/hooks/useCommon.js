import { useState } from "react";
import useRequest from "./useRequest";
import { ShowToast, Severty } from "../helper/toast";

const useCommon = () => {

  const [propertyType, setPropertyType] = useState([])
  const [propertySubType, setPropertySubType] = useState([])

  const { request } = useRequest()

  const getPropertySubType = (id) => {
    request({
      url: '/auth/getPropertySubtype',
      method: 'POST',
      data: { type_id: id },
      onSuccess: ({ data, status }) => {
        status ?
          (setPropertySubType(data))
          :
          setPropertySubType([])
      },
    })
  }

  const getPropertyType = (onSuccess) => {
    request({
      url: '/auth/getPropertyType',
      method: 'GET',
      onSuccess: ({ data, status }) => {
        if (onSuccess) onSuccess()
        status ?
          (setPropertyType(data))
          :
          setPropertyType([])
      },
      onError: () => { if (onSuccess) onSuccess() }
    })
  }

  const favoriteProperty = ({ id, onSuccess }) => {
    request({
      url: '/auth/addToWishList',
      method: 'POST',
      data: { property_id: id },
      onSuccess: ({ message, status }) => {
        if (status) {
          if (onSuccess) onSuccess()
          ShowToast(message, Severty.SUCCESS)
        }
        else {
          ShowToast(message, Severty.ERROR)
        }
      }
    })
  }

  return { propertyType, setPropertyType, propertySubType, getPropertySubType, getPropertyType, favoriteProperty }
}

export default useCommon