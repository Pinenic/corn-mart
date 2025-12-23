"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";


// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPickerModal({
  open,
  onOpenChange,
  initialPosition,
  onSelect,
}) {
  const [position, setPosition] = useState(initialPosition);
  
  useEffect(()=>{
    if(initialPosition[0] === 0 && initialPosition[0] === 0 ){
      return
    }
    setPosition(initialPosition);
  },[initialPosition])


  const handleSave = () => {
    if (!position) return;
    onSelect(position);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Store Location</DialogTitle>
        </DialogHeader>

        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer
            center={position ?? [-15.4167, 28.2833]} // Lusaka default
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              onChange={setPosition}
            />
          </MapContainer>
        </div>

        <Button
          className="w-full bg-primary text-white"
          onClick={handleSave}
          disabled={!position}
        >
          Use this location
        </Button>
      </DialogContent>
    </Dialog>
  );
}
