import axios from "axios";
import React, {
    useState,
    useRef,
    useCallback,
    useContext
} from "react";
import { default as compass } from '../static/images/navigationcompass.svg';
import { default as magnifyingGlass } from '../static/images/magnifyingglass.svg';
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";
import "@reach/combobox/styles.css";

import UserContext from "../auth/UserContext";
import styles from "./mapStyles";
import "./Map.css";


const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const GOOGLE_BASE = "https://maps.googleapis.com/maps/api/";

const libraries = ["places"];
const mapContainerStyle = {
    width: "40vw",
    height: "95vh"
};
const center = {
    lat: 38.090000,
    lng: -96.712900
};
const options = {
    styles,
    mapTypeControl: true,
    mapTypeControlOptions: {
        mapTypeIds: ["roadmap", "terrain"],
    },
    fullscreenControl: false
};



function Locate({
    panTo
}) {
    return (
        <button
            className="compass"
            onClick={() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        panTo({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    () => null);
            }}>
            <img
                src={compass}
                data-toggle="tooltip"
                title="Locate me"
                alt="compass - Locate me" />
        </button>
    )
};


function SearchBox({
    panTo,
    setSelected
}) {
    const kilometers200InMeters = 200 * 1000;

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            location: {
                lat: () => 37.090000,
                lng: () => -95.712900
            },
            radius: kilometers200InMeters
        }
    }); // TODO: update to user lat/lng from browser?



    return (
        <div className="searchBox">
            <Combobox
                onSelect={async (address) => {
                    setValue(address, false);
                    clearSuggestions();
                    try {
                        const results = await getGeocode({ address });
                        const geocode = results[0];

                        const city = geocode.address_components.filter((component) => {
                            return component.types.includes("locality")
                        })[0].long_name;

                        const county = geocode.address_components.filter((component) => {
                            return component.types.includes("administrative_area_level_2")
                        })[0].long_name.split(" ").slice(0, -1).join(" ").trim();

                        const state = geocode.address_components.filter((component) => {
                            return component.types.includes("administrative_area_level_1")
                        })[0].short_name;

                        const { lat, lng } = await getLatLng(geocode);

                        panTo({ lat, lng });
                        setSelected({
                            id: "temp",
                            title: "New Search",
                            lat,
                            lng,
                            state,
                            city,
                            county
                        })
                    } catch (err) {
                        console.log(`error!: ${err}`);
                    }
                }}>
                <ComboboxInput
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    disabled={!ready}
                    placeholder="Enter an address"
                    style={{ "text-align": "center" }}
                />
                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" &&
                            data.map(({ id, description }) => (
                                <ComboboxOption
                                    key={id}
                                    value={description} />
                            ))}
                        {status === "ZERO_RESULTS" &&
                            <ComboboxOption
                                value={"No results found"} />}
                        {status === "NOT_FOUND" &&
                            <ComboboxOption
                                value={"Does not exist (according to google)"} />}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    )
};


function Map({
    setStatus,
    setSearch
}) {

    const { currentUser } = useContext(UserContext);
    const savedSearches = currentUser ? currentUser.searches : null;

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_KEY,
        libraries,
    });

    const [selected, setSelected] = useState(null);

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, []);

    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps...";


    return <div className="map-container">
        <SearchBox
            panTo={panTo}
            setSelected={setSelected} />
        <Locate
            panTo={panTo} />
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={5}
            center={center}
            options={options}
            onLoad={onMapLoad}
            onClick={async (event) => {
                setSelected(null);
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                const url = `${GOOGLE_BASE}geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
                let method = "get";
                try {
                    const geocode = (await axios({ url, method })).data.results[0];

                    const city = geocode.address_components.filter((component) => {
                        return component.types.includes("locality")
                    })[0].long_name;

                    const county = geocode.address_components.filter((component) => {
                        return component.types.includes("administrative_area_level_2")
                    })[0].long_name.split(" ").slice(0, -1).join(" ").trim();

                    const state = geocode.address_components.filter((component) => {
                        return component.types.includes("administrative_area_level_1")
                    })[0].short_name;

                    setSelected({
                        id: "temp",
                        title: "New Click",
                        lat,
                        lng,
                        city,
                        county,
                        state
                    });
                } catch (err) {
                    console.log(err);
                }
            }}>

            {savedSearches.length > 0 &&
                savedSearches.map((search) => {
                    return (<Marker
                        key={search.id}
                        position={{
                            lat: search.lat,
                            lng: search.lng
                        }}
                        icon={{
                            url: { magnifyingGlass },
                            scaledSize: new window.google.maps.Size(12, 12),
                            origin: new window.google.maps.Point(0, 0),
                            anchor: new window.google.maps.Point(6, 6),
                        }}
                        onClick={() => { setSelected(search) }}
                    />);
                })}

            {selected &&
                (<InfoWindow
                    position={{
                        lat: selected.lat,
                        lng: selected.lng
                    }}
                    onCloseClick={() => { setSelected(null) }}>
                    <div>
                        <h2>
                            {selected.title}
                        </h2>
                        <p>
                            <button onClick={() => {
                                setSearch(selected);
                                setStatus("loading");
                            }}>{`Return results for ${selected.city}, ${selected.state}.`}
                            </button>
                        </p>
                    </div>
                </InfoWindow>)
            }
        </GoogleMap>
    </div >

};



export default Map;
