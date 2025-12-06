const axios = require("axios");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Get address from latitude/longitude using OpenStreetMap Nominatim API
 */
async function getAddressFromCoordinates(latitude, longitude) {
    try {
        const response = await axios.get(NOMINATIM_URL, {
            params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                zoom: 18,
                addressdetails: 1
            },
            headers: {
                "User-Agent": "BelieversApp/1.0 (civic-issue-reporting)"
            },
            timeout: 5000
        });

        if (response.data && response.data.address) {
            const addr = response.data.address;
            return {
                success: true,
                address: addr,
                displayName: response.data.display_name,
                latitude: parseFloat(response.data.lat),
                longitude: parseFloat(response.data.lon),
                formatted: formatAddress(addr)
            };
        }

        return {
            success: false,
            error: "Address not found"
        };
    } catch (error) {
        console.error("Nominatim API error:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Format address object into readable string
 */
function formatAddress(address) {
    const components = [
        address.road,
        address.suburb || address.district,
        address.city || address.town,
        address.state,
        address.postcode,
        address.country
    ].filter(Boolean);

    return components.join(", ");
}

module.exports = {
    getAddressFromCoordinates,
    formatAddress
};
