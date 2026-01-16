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
import { createProduct } from "@/lib/inventoryApi";
import { toast } from "sonner";
import { useProfile } from "@/store/useProfile";
import { getCategories } from "@/lib/marketplaceApi";
import SubcategorySelector from "../components/SubcategorySelector";
import { useStoreStore } from "@/store/useStore";
import ImageDropzone from "../components/ImageDropzone";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null); // ✅ single source of truth
  const [tag, setTag] = useState(null);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const { profile } = useProfile();
  const { store } = useStoreStore();

  const storeId = store?.id;
  const userId = profile?.id;

  // ---------------- Fetch categories ----------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
        setCategory(res.data[0] ?? null);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // ---------------- Helpers ----------------
  const handleChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (status) => {
    try {
      setLoading(true);

      await createProduct({
        userId,
        store_id: storeId,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        brand: product.brand,
        // category_id: category?.id,
        category: category?.name,
        subcat: tag,
        images: [thumbnail],
        status,
      });

      toast.success("Product created successfully");
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const addSubcategory = (subcat) => {
    console.log(subcat);
    setCategory((prev) => ({
      ...prev,
      subcategories: [...(prev.subcategories || []), subcat],
    }));
     console.log(category)
    
    setTag(subcat);
  };

  // ---------------- UI ----------------
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
              value={product.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label>Brand</label>
            <Input
              value={product.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label>Category</label>
            <Select
              value={category?.id ?? ""}
              onValueChange={(id) => {
                const selected = categories.find((c) => c.id === id);
                setCategory(selected);
                setTag(null); // reset subcategory
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Subcategory</label>
            <SubcategorySelector
              category={category}
              selected={tag}
              onSelect={setTag}
              onCreate={addSubcategory}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label>Description</label>
            <Textarea
              value={product.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------- Pricing ---------- */}
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
          <div className="space-y-2">
            <label>Stock</label>
            <Input
              type="number"
              placeholder="0"
              value={product.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------- Images ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageDropzone value={thumbnail} onChange={setThumbnail} />
        </CardContent>
      </Card>

      {/* ---------- Actions ---------- */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => handleSubmit("draft")}>
          Draft
        </Button>
        <Button onClick={() => handleSubmit("published")}>
          {loading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
