
import { useState, useEffect, useRef, useContext } from "react";
import { geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';


const useLocation = () => {

    const [location, setLocation] = useState()
    const [locationData, setLocationData] = useState(null);
    const [addressComponent, setAddressComponent] = useState({})

    useEffect(() => {
        if (!location) return
        const { lat, lng } = location
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyB3gCUnXVbdOtWCQTFc9z5cnlCG1LDgsrk`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                FormatData(data.results[0])
            })
            .catch(error => console.log(error));
    }, [location]);

    const getCurrentLocation = ({isReturn}) => {
       return new Promise((resolve,reject)=>{
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
    
                    if(isReturn) return resolve({lat: position.coords.latitude,lng: position.coords.longitude })
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    resolve()
                });
            } else {
                setLocation()
                reject()
            }
        })
    }

    const FormatData = (results) => {
        const addressComponents = results.address_components

        const postalCodeObj = addressComponents.find(component => component.types.includes('postal_code'));
        const postalCode = postalCodeObj ? postalCodeObj.long_name : null;

        const cityObj = addressComponents.find(component => component.types.includes('locality'));
        const city = cityObj ? cityObj.long_name : null;

        setAddressComponent((prev => ({ ...prev, address: results.formatted_address, city: city, zip_code: postalCode })))
    }

    const getLocation = (place_id) => {

        geocodeByPlaceId(place_id)
            .then(results => {
                FormatData(results[0])
                getLatLong(results[0])
            })
            .catch(error => console.error(error));
    }

    const getLatLong = async (results) => {
        try {
            const response = await getLatLng(results)
            setLocation(response)
        }
        catch (err) {
            console.log(err);
        }
    }

    return { location, setLocationData, locationData, getCurrentLocation, addressComponent, getLocation }
}

export default useLocation