"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import { createProduct } from "@/lib/inventoryApi";
import { toast } from "sonner";
import { useProfile } from "@/store/useProfile";

export default function AddProductPage() {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    brand: "",
    color: "",
    description: "",
    stock: "",
    price: "",
  });
  const {profile} = useProfile()
  const storeId = profile.stores[0]?.id;
  const userId = profile.id;

  const [Loading, setLoading] = useState(false);
  const [message, setMeassage] = useState("");

  const handleChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (status) => {
    console.log("Submitting product:", { ...product, status });
    try {
        setLoading(true);
        const res = await createProduct({ userId, name:product.name, description:product.description, price:product.price, store_id:storeId, category:product.category, images:[] });
        res?.success ? setMeassage(res.success) : setMeassage("Something went wrong");
        setProduct({
            name: "",
            category: "",
            brand: "",
            color: "",
            description: "",
            stock: "",
            price: "",
          });
          toast.success("Product has been created Succesfully", message)
          setLoading(false);
    } catch (error) {
        console.error("Failed to create product", error.message);
        toast.success("Failed to create product")
    }
    
  };

  return (
    <div className="p-6 space-y-6">
      {/* ---------- Product Description ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Product Description</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label>Product Name</label>
            <Input
              placeholder="Enter product name"
              value={product.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label>Category</label>
            <Select
              value={product.category}
              onValueChange={(val) => handleChange("category", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="camera">Camera</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Brand</label>
            <Select
              value={product.brand}
              onValueChange={(val) => handleChange("brand", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="asus">ASUS</SelectItem>
                <SelectItem value="canon">Canon</SelectItem>
                <SelectItem value="bose">Bose</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Color</label>
            <Select
              value={product.color}
              onValueChange={(val) => handleChange("color", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label>Description</label>
            <Textarea
              placeholder="Product details (optional)"
              value={product.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------- Pricing & Availability ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Availability</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label>Price</label>
            <Input
              type="number"
              placeholder="0"
              value={product.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          {/* <div className="space-y-2">
            <label>Availability Status</label>
            <Select
              value={product.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </CardContent>
      </Card>

      {/* ---------- Product Images ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop <br />
              <span className="text-gray-400 text-xs">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Buttons ---------- */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => handleSubmit("draft")}
        >
          Draft
        </Button>
        <Button onClick={() => handleSubmit("published")}>
          {Loading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
