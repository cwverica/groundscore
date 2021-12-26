import React, {
    useState,
    useRef,
    useCallback,
    useContext
} from "react";
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
import { GOOG_API } from "../keys";
import styles from "./mapStyles";


const libraries = ["places"];
const mapContainerStyle = {
    width: "99.5vw",
    height: "91.2vh"
};
const center = {
    lat: 37.090000,
    lng: -95.712900
};
const options = {
    styles,
    mapTypeControl: true,
    mapTypeControlOptions: {
        // style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ["roadmap", "terrain"],
    },
    fullscreenControl: false
};



function Locate({ panTo }) {
    return (
        <button
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
                src="navigation-compass-find-position-device-svgrepo-com.svg"
                alt="compass - Locate me" />
        </button>
    )
}

function Search({ panTo, setSelected }) {
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
            <Combobox onSelect={async (address) => {
                setValue(address, false);
                clearSuggestions();
                try {
                    const results = await getGeocode({ address });
                    const { lat, lng } = await getLatLng(results[0]);
                    panTo({ lat, lng });
                    setSelected({ lat, lng, id: "temp", title: "New Search" })
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
                />
                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" && data.map(({ id, description }) => (
                            <ComboboxOption key={id} value={description} />
                        ))}
                        {status === "ZERO_RESULTS" && "No results found"}
                        {status === "NOT_FOUND" && "Does not exist (according to google)"}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    )
}


function Map() {

    const { currentUser } = useContext(UserContext);
    const savedSearches = currentUser.searches;

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOG_API.KEY,
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


    return <div>
        <Search panTo={panTo} setSelected={setSelected} /><Locate panTo={panTo} />
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={5}
            center={center}
            options={options}
            onLoad={onMapLoad}>

            {savedSearches && savedSearches.map((search) => {
                <Marker
                    key={search.id}
                    position={{ lat: search.lat, lng: search.lng }}
                    icon={{
                        url: "../static/images/magnifying-glass-svgrepo-com.svg",
                        scaledSize: new window.google.maps.Size(12, 12),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(6, 6),
                    }}
                    onClick={() => { setSelected(search) }}
                />
            })}

            {selected ? (<InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => { setSelected(null) }}>
                <div>
                    <h2>{selected.title}</h2>
                    <p><a href="#">Return results for here.</a></p>
                </div>
            </InfoWindow>) : null}
        </GoogleMap>
    </div>

}

export default Map;
