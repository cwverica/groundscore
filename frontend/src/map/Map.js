import axios from "axios";
import React, {
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
    useState
} from "react";
import {
    default as compass
} from '../static/images/navigationcompass.svg';
import {
    default as magnifyingGlass
} from '../static/images/magnifyingglass.svg';
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

import SearchContext from "../context/SearchContext";
import UserContext from "../context/UserContext";
import styles from "./mapStyles";
import "./Map.css";


const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const GOOGLE_BASE = "https://maps.googleapis.com/maps/api/";

const libraries = ["places"];

const center = {
    lat: 38.090000,
    lng: -96.712900
};
const options = {
    styles,
    mapTypeControl: false,
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
    });



    return (
        <div className="search-box-container">
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
                    className="search-box"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    disabled={!ready}
                    placeholder="Enter an address"
                    style={{
                        "fontSize": "1.3rem",
                        "textAlign": "center",
                        "width": "275px",
                        "height": "37px"
                    }}
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


function Map() {

    let sm = window.matchMedia('(max-width: 680px)').matches;
    let lg = window.matchMedia('(min-width: 1675px)').matches;
    const styleObj = sm ?
        {
            width: "100vw",
            height: "35vh"
        } : lg ?
            {
                width: "calc(200px + 38vw)",
                height: "95vh",
            }
            : {
                width: "40vw",
                height: "95vh"
            };

    const [mapContainerStyle, setMapContainerStyle] = useState(styleObj);

    useEffect(() => {
        function handleResize() {
            let width, height;
            if (window.matchMedia('(max-width: 680px)').matches) {
                width = "100vw";
                height = "35vh";
            } else if (window.matchMedia('(min-width: 1675px)').matches) {
                width = "calc(200px + 38vw)";
                height = "95vh";
            } else {
                width = "40vw";
                height = "95vh";
            }

            setMapContainerStyle({ width, height });
        }

        window.addEventListener('resize', handleResize);

        return _ => {
            window.removeEventListener('resize', handleResize)
        }
    }, []);

    const {
        setStatus,
        setSearch,
        setSelected,
        selected
    } = useContext(SearchContext);

    const { currentUser, searches } = useContext(UserContext);
    const savedSearches = currentUser ? searches : null;

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_KEY,
        libraries,
    });

    const [, forceUpdate] = useReducer(x => x + 1, 0);


    useEffect(function updateMap() {
        forceUpdate();
    }, [searches])



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

            {currentUser &&
                savedSearches.map((search) => {
                    return (<Marker
                        key={search.id}
                        position={{
                            lat: search.lat,
                            lng: search.lng
                        }}
                        icon={{
                            url: magnifyingGlass,
                            scaledSize: new window.google.maps.Size(30, 30),
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
                        <h4>
                            {selected.title}
                        </h4>
                        <p>
                            <button onClick={() => {
                                setSearch(selected);
                                setStatus("loading");
                            }}>{`Search in ${selected.city || selected.county}, ${selected.state}.`}
                            </button>
                        </p>
                    </div>
                </InfoWindow>)
            }
        </GoogleMap>
    </div >

};



export default Map;
