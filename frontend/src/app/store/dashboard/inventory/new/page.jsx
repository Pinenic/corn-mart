"use client";

import { useEffect, useState } from "react";
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
import { getCategories } from "@/lib/marketplaceApi";
import SubcategorySelector from "../components/SubcategorySelector";
import { useStoreStore } from "@/store/useStore";
import ImageDropzone from "../components/ImageDropzone";
import { useRouter } from "next/navigation";

let Categories = [];

try {
  const cursor = await getCategories();
  Categories = cursor.data;
} catch (err) {
  // server-side fetch failed; client will handle retries
  console.error("Failed to fetch order on server:", err?.message || err);
}
export default function AddProductPage() {
  const router = useRouter();
  const [category, setCategory] = useState(Categories[0]);
  const [product, setProduct] = useState({
    name: "",
    category: category?.name || "",
    brand: "",
    color: "",
    description: "",
    stock: "",
    price: "",
  });
  const [tag, setTag] = useState();
  const { profile } = useProfile();
  const { store } = useStoreStore();
  const storeId = store?.id;
  const userId = profile?.id;

  const [Loading, setLoading] = useState(false);
  const [message, setMeassage] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  const handleChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (status) => {
    console.log("Submitting product:", { ...product, status });
    try {
      setLoading(true);
      const res = await createProduct({
        userId,
        name: product.name,
        description: product.description,
        price: product.price,
        store_id: storeId,
        category: product.category,
        brand: product.brand,
        images: [thumbnail],
        subcat: tag
      });
      res?.success
        ? setMeassage(res.success)
        : setMeassage("Something went wrong");
      setProduct({
        name: "",
        category: "",
        brand: "",
        color: "",
        description: "",
        stock: "",
        price: "",
      });
      toast.success("Product has been created Succesfully", message);
      setLoading(false);
      router.back();
    } catch (error) {
      console.error("Failed to create product", error.message);
      toast.success("Failed to create product");
    }
  };

  const addSubcategory = (subcat) => {
    setCategory((prevState) => ({
      ...prevState, // Copy all properties from the previous state object
      subcategories: [...prevState.subcategories, subcat], // Create a new array with existing items and the new item
    }));
    setTag(subcat);
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
            <label>Brand</label>
            <Input
              placeholder="Enter brand"
              value={product.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
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
                {Categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.name}
                    onClick={() => setCategory(cat)}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Tag</label>
            <SubcategorySelector
              category={category}
              selected={tag}
              onSelect={setTag}
              onCreate={addSubcategory}
            />
            {/* <Select
              value={product.color}
              onValueChange={(val) => handleChange("color", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select> */}
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
          <CardTitle>Pricing</CardTitle>
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
          <ImageDropzone
            value={thumbnail}
            onChange={(file) => setThumbnail(file)}
          />
        </CardContent>
      </Card>

      {/* ---------- Buttons ---------- */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => handleSubmit("draft")}>
          Draft
        </Button>
        <Button onClick={() => handleSubmit("published")}>
          {Loading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
