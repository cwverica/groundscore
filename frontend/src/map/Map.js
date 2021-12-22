import React, {
    useState,
    useRef,
    useCallback
} from "react";
import {
    GoogleMap,
    useLoadScript,
    // Marker,
    // InfoWindow,
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
    styles
};


function Search() {
    const kilometers200InMeters = 200 * 1000;

    const {
        ready,
        value,
        suggestions,
        setValue,
        clearSuggestion,
    } = usePlacesAutocomplete({
        requestOptions: {
            location: {
                lat: () => 37.090000,
                lng: () => -95.712900,
                radius: kilometers200InMeters
            }
        }
    }); // TODO: update to user lat/lng from browser

    console.log(JSON.stringify(suggestions))
    const { data, status } = suggestions;

    console.log(`ready: ${ready}, val: ${value}, \nstatus: ${status}, data: ${data}`)
    // TODO: not getting any status or data

    return (
        <div className="searchBox">
            <Combobox onSelect={async (address) => {
                try {
                    const results = await getGeocode({ address });
                    clearSuggestion();
                    console.log(`result: ${results[0]}`)

                } catch (err) {
                    console.log(`error!: ${err}`);
                }
                console.log(address);
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


    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOG_API.KEY,
        libraries,
    });

    // const [selected, setSelected] = useState(null);

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, [])
    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps...";

    return <div>
        <Search />
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={5}
            center={center}
            options={options}
            onLoad={onMapLoad}>

            {/* {if (savedSearches && savedSearches.map((search) => {
                <Marker
                    key={search.id}
                    position={{ lat: search.lat, lng: search.lng }}
                    icon={{
                        url: "./location/to/magnifyingglass.svg",
                        scaledSize: new window.google.maps.Size(12, 12),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(6, 6)
                    }}
                    onClick={() => {setSelected{search}}}
                    />
            }))} */}

            {/* {selected ? (<InfoWindow 
                                position={{lat: search.lat, lng: search.lng}}
                                onCloseClick={() => {setSelected(null)}}>
                <div>
                    <h2>{search.title}</h2>
                    <p><a href="#">Go to search</a></p>
                </div>
            </InfoWindow>) : null } */}
        </GoogleMap>
    </div>

}

export default Map;
