import React, { useState, useEffect } from "react";
import { Input } from "antd";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
const libraries = ["drawing", "places"];

const LocationMap = ({ onChange, userData, editLocation }) => {
  const [userAddress, setUserAddress] = useState(null);
  const [map, setMap] = useState(null);
  const [coordinates, setCoordinates] = useState({
    lat: editLocation?.latitude || 30.5595,
    lng: editLocation?.longitude || 22.9375,
  });

  const handleLocationSelect = async (selectedAddress) => {
    try {
      const results = await geocodeByAddress(selectedAddress);
      const { lat, lng } = await getLatLng(results[0]);
      setCoordinates({ lat, lng });
      setUserAddress(selectedAddress);
      if (onChange) {
        // onChange({ address: selectedAddress, latitude: lat, longitude: lng });
        const address = {
          location: results[0]?.formatted_address,
          latitude: lat,
          longitude: lng,
          city: results[0]?.address_components?.filter((item) =>
            item?.types?.includes("locality")
          )[0]?.long_name,
          country: results[0]?.address_components?.filter((item) =>
            item?.types?.includes("country")
          )[0]?.long_name,
          postal_code: results[0]?.address_components?.filter((item) =>
            item?.types?.includes("postal_code")
          )[0]?.long_name,
        };
        onChange(address);
      }
    } catch (error) {
      console.error("Error while selecting location:", error);
    }
  };

  const geocodeByLatLng = async (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results[0]);
        } else {
          reject(new Error("Geocoder request failed."));
        }
      });
    });
  };

  const handleMarkerDrag = async (event) => {
    try {
      const { latLng } = event;
      const lat = latLng.lat();
      const lng = latLng.lng();
      setCoordinates({ lat, lng });
      const results = await geocodeByLatLng(lat, lng);
      if (!!results) {
        const selectedAddress = results?.formatted_address;
        setUserAddress(selectedAddress);
        if (onChange) {
          // onChange({ address: selectedAddress, latitude: lat, longitude: lng });
          const address = {
            location: results?.formatted_address,
            latitude: lat,
            longitude: lng,
            // city: results?.address_components?.filter((item) =>
            //   item?.types?.includes("locality")
            // )[0]?.long_name,
            // country: results?.address_components?.filter((item) =>
            //   item?.types?.includes("country")
            // )[0]?.long_name,
            postal_code: results?.address_components?.filter((item) =>
              item?.types?.includes("postal_code")
            )[0]?.long_name,
          };
          onChange(address);
          // console.log(address)
        }
      }
    } catch (error) {
      console.error("Error while dragging marker:", error);
    }
  };

  useEffect(() => {
    if (editLocation) {
      setUserAddress(editLocation.location);
      setCoordinates({
        ...coordinates,
        lat: parseFloat(editLocation.latitude),
        lng: parseFloat(editLocation.longitude),
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setCoordinates({
            lat: parseFloat(position.coords.latitude),
            lng: parseFloat(position.coords.longitude),
          });
        });
      }
    }
  }, [editLocation]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDQ2DCe8qS4qVCkMtRZRnZZ_TF2qq1HSvs",
    libraries,
  });

  if (!isLoaded) {
    return <div className="text-center">Loading Map</div>;
  }

  return (
    <>
      <PlacesAutocomplete
        value={userAddress}
        onChange={setUserAddress}
        onSelect={handleLocationSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <>
            <Input {...getInputProps({ placeholder: "Search Location" })} />
            <div className="autocomplete-dropdown-container">
              {loading && <div>Please Wait...</div>}

              {suggestions.map((suggestion) => {
                const className = suggestion.active
                  ? "suggestion-item--active"
                  : "suggestion-item";
                const style = suggestion.active
                  ? { backgroundColor: "#fafafa", cursor: "pointer" }
                  : { backgroundColor: "#ffffff", cursor: "pointer" };

                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    {" "}
                    <span>{suggestion.description}</span>{" "}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </PlacesAutocomplete>

      <GoogleMap
        center={coordinates}
        zoom={14}
        mapContainerClassName="googleMap"
        onLoad={(map) => setMap(map)}
      >
        <Marker
          position={coordinates}
          draggable={true}
          onDragEnd={handleMarkerDrag}
        />
      </GoogleMap>
    </>
  );
};

export default LocationMap;
