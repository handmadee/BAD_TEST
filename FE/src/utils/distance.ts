// Utility functions để tính khoảng cách thực tế

/**
 * Tính khoảng cách giữa 2 tọa độ sử dụng Haversine formula
 * @param lat1 - Latitude điểm 1
 * @param lng1 - Longitude điểm 1
 * @param lat2 - Latitude điểm 2
 * @param lng2 - Longitude điểm 2
 * @returns Khoảng cách theo km
 */
export const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Bán kính Trái Đất (km)

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Tính khoảng cách giữa user và court
 * @param userLocation - Vị trí user {lat, lng}
 * @param courtLocation - Vị trí court {lat, lng}
 * @returns Khoảng cách formatted "X.X km"
 */
export const getDistanceString = (
    userLocation: { lat: number; lng: number } | null,
    courtLocation: { lat: number; lng: number } | null
): string => {
    if (!userLocation || !courtLocation) {
        return "N/A";
    }

    const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        courtLocation.lat,
        courtLocation.lng
    );

    // Làm tròn 1 chữ số thập phân
    return `${distance.toFixed(1)}km`;
};

/**
 * Tính khoảng cách số để sắp xếp
 * @param userLocation - Vị trí user {lat, lng}
 * @param courtLocation - Vị trí court {lat, lng}
 * @returns Khoảng cách số (km)
 */
export const getDistanceNumber = (
    userLocation: { lat: number; lng: number } | null,
    courtLocation: { lat: number; lng: number } | null
): number => {
    if (!userLocation || !courtLocation) {
        return 999; // Số lớn để đẩy xuống cuối danh sách
    }

    return calculateDistance(
        userLocation.lat,
        userLocation.lng,
        courtLocation.lat,
        courtLocation.lng
    );
};
