import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocode } from "@/lib/geocode";

// Fix default marker icon issue in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  className?: string;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click: async (e) => {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position} />;
}

export const LocationPicker = ({ lat, lng, onLocationSelect, className }: LocationPickerProps) => {
  const [isResolving, setIsResolving] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const defaultCenter: [number, number] = [21.0285, 105.8542]; // Hanoi, Vietnam
  const center: [number, number] = lat && lng ? [lat, lng] : (userLocation || defaultCenter);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation && !lat && !lng) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Could not get user location:", error.message);
          // Silently fail and use default location
        }
      );
    }
  }, [lat, lng]);

  const handleLocationClick = async (clickLat: number, clickLng: number) => {
    setIsResolving(true);
    try {
      // Normalize coordinates to valid ranges
      // Latitude: -90 to 90
      // Longitude: -180 to 180
      let normalizedLng = clickLng;
      while (normalizedLng > 180) normalizedLng -= 360;
      while (normalizedLng < -180) normalizedLng += 360;
      
      const normalizedLat = Math.max(-90, Math.min(90, clickLat));
      
      console.log('Original coords:', { lat: clickLat, lng: clickLng });
      console.log('Normalized coords:', { lat: normalizedLat, lng: normalizedLng });
      
      const res = await reverseGeocode(normalizedLat, normalizedLng);
      console.log('Reverse geocode response:', res); // Debug log
      
      if (res && res.display_name) {
        const locationName = res.display_name;
        console.log('Location name to set:', locationName); // Debug log
        onLocationSelect(normalizedLat, normalizedLng, locationName);
      } else {
        // Fallback: use coordinates as location name
        const fallbackName = `${normalizedLat.toFixed(6)}, ${normalizedLng.toFixed(6)}`;
        console.log('Using fallback location name:', fallbackName);
        onLocationSelect(normalizedLat, normalizedLng, fallbackName);
      }
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
      // Normalize coordinates before fallback
      let normalizedLng = clickLng;
      while (normalizedLng > 180) normalizedLng -= 360;
      while (normalizedLng < -180) normalizedLng += 360;
      const normalizedLat = Math.max(-90, Math.min(90, clickLat));
      // Still set coordinates even if geocoding fails
      const fallbackName = `Lat: ${normalizedLat.toFixed(6)}, Lng: ${normalizedLng.toFixed(6)}`;
      onLocationSelect(normalizedLat, normalizedLng, fallbackName);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <MapContainer
          // @ts-ignore - react-leaflet v4 props type issue
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
          className="z-0"
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            // @ts-ignore - react-leaflet v4 props type issue
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={handleLocationClick} />
          {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
        {isResolving && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg z-10">
            <div className="bg-card px-4 py-2 rounded-md shadow-lg">
              <p className="text-sm font-medium">Đang tìm địa điểm...</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Nhấp vào bản đồ để chọn vị trí. Tên địa điểm sẽ được tự động tìm kiếm (có thể mất vài giây).
      </p>
    </div>
  );
};
