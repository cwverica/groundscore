import { Loader } from "@googlemaps/js-api-loader";

import { GOOG_API } from "../keys";

const loader = new Loader({
    apiKey: GOOG_API.KEY,
    version: "weekly",
    ...additionalOptions,
});

loader.load().then(() => {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    });
});
