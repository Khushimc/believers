const axios = require("axios");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Get location details from latitude and longitude using Nominatim API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Location details
 */
exports.reverseGeocode = async (latitude, longitude) => {
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
            }
        });

        if (response.data) {
            return {
                success: true,
                address: response.data.address,
                displayName: response.data.display_name,
                latitude: response.data.lat,
                longitude: response.data.lon,
                boundingBox: response.data.boundingbox
            };
        }

        return {
            success: false,
            error: "No address found for coordinates"
        };
    } catch (error) {
        console.error("Nominatim API error:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Format address components into a readable string
 * @param {Object} address - Address object from Nominatim
 * @returns {string} Formatted address string
 */
exports.formatAddress = (address) => {
    const components = [
        address.road,
        address.suburb || address.district,
        address.city || address.town,
        address.state,
        address.postcode,
        address.country
    ].filter(Boolean);

    return components.join(", ");
};

/**
 * Extract city and area from address
 * @param {Object} address - Address object from Nominatim
 * @returns {Object} City and area information
 */
exports.extractLocationInfo = (address) => {
    return {
        road: address.road || null,
        area: address.suburb || address.district || null,
        city: address.city || address.town || null,
        state: address.state || null,
        postcode: address.postcode || null,
        country: address.country || null
    };
};
