import axios from "axios";

import FBI_API from "keys";


const stateAbbreviations =
    [
        "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "ID", "IL",
        "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
        "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "OH", "OK", "OR", "PA",
        "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];



// const counties = "KAUFMAN";
// console.log(counties);
// const countySplit = counties.split(";");
// const countyList = countySplit.map((county) => {
//     return county.trim();
// });


// https://api.usa.gov/crime/fbi/sapi/api/agencies/byStateAbbr/TX
