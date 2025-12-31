"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import MapPickerModal from "./MapPickerModal";

const DELIVERY_METHODS = [
  { id: "bike", label: "Motorbike" },
  { id: "car", label: "Car" },
  { id: "pickup", label: "Store Pickup" },
];

export default function StorePreferencesTab({
  value,
  onChange,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    address: "",
    city: "",
    province: "",
    country: "Zambia",
    latitude: 0,
    longitude: 0,
    delivery_enabled: false,
    delivery_radius_km: 0,
    delivery_fee: 0,
    delivery_methods: [],
  });
  const [mapOpen, setMapOpen] = useState(false);

  /* -------- Sync external value -------- */
  useEffect(() => {
    if (!value) return;

    const sanitized = Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, val ?? ""])
    );

    setForm((prev) => ({
      ...prev,
      ...sanitized,
    }));
  }, [value]);

  const update = (key, val) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: val };
      onChange?.(updated);
      console.log(updated);
      return updated;
    });
  };

  const toggleMethod = (method) => {
    update(
      "delivery_methods",
      form.delivery_methods.includes(method)
        ? form.delivery_methods.filter((m) => m !== method)
        : [...form.delivery_methods, method]
    );
  };

  return (
    <div className="space-y-6 lg:w-3xl">
      {/* -------- Location -------- */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Store Location</h3>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Province</Label>
            <Input
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Country</Label>
          <Select
            value={form.country}
            onValueChange={(v) => update("country", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Zambia">Zambia</SelectItem>
              <SelectItem value="South Africa">South Africa</SelectItem>
              <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => update("latitude", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => update("longitude", e.target.value)}
          />
          <Button
            variant="outline"
            type="button"
            onClick={() => setMapOpen(true)}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Pick on map
          </Button>
        </div>

        <MapPickerModal
          open={mapOpen}
          onOpenChange={setMapOpen}
          initialPosition={
            (form.latitude != null && form.longitude != null)
              ? [Number(form.latitude), Number(form.longitude)]
              : [-15.4167, 28.2833]
          }
          onSelect={(pos) => {
            update("latitude", pos.lat.toFixed(6));
            update("longitude", pos.lng.toFixed(6));
          }}
        />
      </div>

      {/* -------- Delivery -------- */}
      <div className="space-y-4 border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Enable delivery for this store
            </p>
          </div>
          <Switch
            checked={form.delivery_enabled}
            onCheckedChange={(v) => update("delivery_enabled", v)}
          />
        </div>

        {form.delivery_enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Delivery Radius (km)</Label>
              <Input
                type="number"
                value={form.delivery_radius_km}
                onChange={(e) => update("delivery_radius_km", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery Fee</Label>
              <Input
                type="number"
                value={form.delivery_fee}
                onChange={(e) => update("delivery_fee", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Delivery Methods</Label>
              {DELIVERY_METHODS.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.delivery_methods.includes(m.id)}
                    onCheckedChange={() => toggleMethod(m.id)}
                  />
                  <span className="text-sm">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* -------- Submit -------- */}
      {onSubmit && (
        <Button
          className="w-full bg-primary text-white"
          disabled={loading}
          onClick={() => onSubmit(form)}
        >
          {loading ? "Saving…" : "Save Location"}
        </Button>
      )}
    </div>
  );
}
