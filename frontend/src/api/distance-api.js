
/** Takes two objects of form { lat, lng } and 
 * calculates the distance between the two
 * 
 * returns that distance
 */
async function calculateDistance(lat1, lng1, lat2, lng2, unit = "K") {
    try {
        let res = (await axios(`https://code.010pixel.com/projects/distance/?lat1=${lat1}&lat2=${lat2}&long1=${lng1}&long2=${lng2}&unit=${unit}`)).data;
        return res;
    } catch (err) {
        console.error("Distance API Error:", err.response);
        let message = err.response.data.error.message;
        throw Array.isArray(message) ? message : [message];
    }
    // make a get request to:
    // https://code.010pixel.com/projects/distance/?lat1=${lat1}&lat2=${lat2}&long1=${lng1)&long2=${lng2}&unit=K
    // options for unit can be K (Kilometeres), M (Miles), or N (Nautical Miles)
}

