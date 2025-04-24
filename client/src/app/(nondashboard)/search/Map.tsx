
"use client";
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

// Fix Leaflet marker icon paths
const DefaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  if (isLoading) return <>Loading map...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl z-0">
      <MapContainer
        center={filters.coordinates || [28.6139, 77.2090]} // Default to Delhi
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />
        {properties.map((property: Property) => {
          const lat = property.location?.coordinates?.latitude;
          const lng = property.location?.coordinates?.longitude;

          if (typeof lat !== "number" || typeof lng !== "number") return null; // Skip invalid

          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
            >
              <Popup>
                <div className="marker-popup">
                  <a
                    href={`/search/${property.id}`}
                    target="_blank"
                    className="marker-popup-title"
                  >
                    {property.name}
                  </a>
                  <p>₹{property.pricePerMonth} / month</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
