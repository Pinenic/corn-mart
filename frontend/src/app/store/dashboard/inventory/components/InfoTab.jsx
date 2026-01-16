"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  addProductImages,
  addProductVariantImages,
  createVariant,
  deleteVariant,
  getAllVariants,
  updateProduct,
  updateVariant,
} from "@/lib/inventoryApi";
import {
  PencilIcon,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import VariantImageRow from "./VariantImageRow";
import { ProductEditDialog } from "./ProductEditDialog";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import { ProductDeleteDialog } from "./DeleteDialog";
import { CreateVariantDialog } from "./CreateVariantDialog";
import { Spinner } from "@/components/ui/spinner";
import {
  getProductImages,
  uploadProductImages,
  deleteImage,
  setImageAsThumbnail,
} from "@/lib/inventoryApi";
import LoadingOverlay from "./loading-overlay";
import { useAuthStore } from "@/store/useAuthStore";

export function Info({ prod, reload }) {
  const [formData, setFormData] = useState({});
  const [Loading, setLoading] = useState(false);
  const [message, setMeassage] = useState("");

  // const userId = "fa31a398-aaa8-4bc3-aeb4-4332684f116c";
  const { init, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      return;
    }
    init();
  }, [user]);

  useEffect(() => {
    setFormData({
      name: prod.name,
      description: prod.description,
      category: prod.category,
      price: prod.price,
      is_active: prod.is_active,
    });
  }, [prod]);

  const toggle = (key) =>
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Updating product:", { ...prod });
    try {
      setLoading(true);
      const res = await updateProduct(prod.id, {
        userId: user.id,
        updates: formData,
        newImages: [],
        removedImageIds: [],
      });
      res?.success
        ? setMeassage(res.success)
        : setMeassage("Something went wrong");
      reload();
      setLoading(false);
      toast.success("Product has been updated Succesfully");
    } catch (error) {
      console.error("Failed to update product", error.message);
      toast.success("Failed to update product");
    }
  };
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Textarea
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-4">
        <Input
          name="category"
          type="text"
          value={formData.category}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-4">
        <Input
          name="price"
          type="text"
          value={formData.price}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="active">Active</Label>
        <Switch
          id="active"
          checked={formData.is_active}
          onCheckedChange={() => toggle("is_active")}
        />
      </div>

      <Button
        className="w-full border-2 bg-transparent hover:bg-primary/80 hover:text-white text-primary"
        onClick={handleSubmit}
      >
        {Loading ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}

export function Variants({ prodId, reload }) {
  const [varis, setVaris] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDelOpen, setIsDelOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variloading, setVariLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadVariants() {
    try {
      setVariLoading(true);
      const data = await getAllVariants(prodId);
      setVaris(data);
      setVariLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }
  async function refreshVariants() {
    try {
      const data = await getAllVariants(prodId);
      setVaris(data);
      reload();
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    loadVariants();
  }, [prodId]);
  const handleEditDialog = (variant) => {
    setSelectedVariant(variant);
    setIsEditOpen(true);
  };
  const handleDeleteDialog = (variant) => {
    setSelectedVariant(variant);
    setIsDelOpen(true);
  };

  const handleCreateVariant = async ({
    name,
    description,
    stock,
    price,
    low_stock_threshold,
  }) => {
    try {
      setLoading(true);
      const res = await createVariant({
        productId: prodId,
        name,
        description,
        price,
        stock,
        lowStockThreshold: low_stock_threshold,
      });
      refreshVariants();
      setLoading(false);
      res
        ? toast.success("Variant has been created Succesfully")
        : toast.error("Failed to creat Variant");
    } catch (error) {
      console.error("Failed to creat Variant", error.message);
      toast.error(error.messsage);
      setLoading(false);
    }
  };

  const handleEditVariant = async ({
    name,
    description,
    stock,
    price,
    low_stock_threshold,
  }) => {
    try {
      setLoading(true);
      const res = await updateVariant(selectedVariant.id, {
        name,
        description,
        price,
        stock,
        low_stock_threshold,
      });
      res
        ? toast.success("Variant has been updated Succesfully")
        : toast.error("Failed to update Variant");
      loadVariants();
      reload();
      setLoading(false);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update Variant", error.message);
      toast.error(error.messsage);
      setLoading(false);
    }
  };

  const handleDeleteVariant = async () => {
    try {
      setLoading(true);
      const res = await deleteVariant(selectedVariant.id);
      res
        ? toast.success("Variant has been deleted Succesfully")
        : toast.error("Failed to delete Variant");
      loadVariants();
      setLoading(false);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to delete Variant", error.message);
      toast.error(error.messsage);
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsOpen(true)} disabled={varis.length > 3}>
          <IconCirclePlusFilled />
          <span>Create</span>
        </Button>

        <CreateVariantDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          onCreate={handleCreateVariant}
          loading={loading}
        />
      </div>

      {variloading ? (
        <>
          <div className="flex items-center justify-center">
            {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
            <Spinner className="size-8 text-primary" />
          </div>
        </>
      ) : (
        <>
          {varis.map((vari) => (
            <div key={vari.id} className="flex justify-between border-b p-2">
              <div className="flex flex-col gap-3">
                <h2>
                  {vari.name} | K{vari.price}
                </h2>
                <p className="text-xs text-muted-foreground">
                  stock: {vari.stock} ({vari.available_stock} available,{" "}
                  {vari.reserved_stock} reserved)
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-end space-x-2">
                  {/* <Label htmlFor="active">Active</Label> */}
                  {/* <Switch
                    id="active"
                    // checked={formData.is_active}
                    // onCheckedChange={() => toggle("is_active")}
                  /> */}
                </div>
                <div className="flex gap-4 justify-end">
                  <PencilIcon
                    className="w-4 text-blue-700 hover:bg-blue-700/50 hover:cursor-pointer"
                    onClick={() => handleEditDialog(vari)}
                  />
                  <Trash2
                    className="w-4 text-red-700 hover:cursor-pointer"
                    onClick={() => handleDeleteDialog(vari)}
                  />
                </div>
              </div>
            </div>
          ))}
          <ProductEditDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            product={selectedVariant}
            onSave={handleEditVariant}
            loading={loading}
          />
          <ProductDeleteDialog
            open={isDelOpen}
            onOpenChange={setIsDelOpen}
            product={selectedVariant}
            onConfirm={handleDeleteVariant}
            loading={loading}
          />
        </>
      )}
    </>
  );
}

export function Media({ prodId }) {
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const { init, user } = useAuthStore();

  useEffect(() => {
    if (!user) init();
  }, [user]);

  async function loadData() {
    console.log("fetching...");
    setLoading(true);

    const imgRes = await getProductImages(prodId);
    const varRes = await getAllVariants(prodId);

    setImages(imgRes.data || []);
    setVariants(varRes || []);
    setLoading(false);
  }

  async function refreshData() {
    const imgRes = await getProductImages(prodId);
    const varRes = await getAllVariants(prodId);

    setImages(imgRes.data || []);
    setVariants(varRes || []);
  }

  useEffect(() => {
    if (prodId) loadData();
  }, [prodId]);

  const groupedImages = useMemo(() => {
    const map = { default: [] };

    images.forEach((img) => {
      if (img.variant_id) {
        if (!map[img.variant_id]) map[img.variant_id] = [];
        map[img.variant_id].push(img);
      } else {
        map.default.push(img);
      }
    });

    return map;
  }, [images]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[20vh]">
          {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
          <Spinner className="size-8 text-primary" />
        </div>
      </>
    );
  }

  return (
    <div className="h-96 overflow-y-auto space-y-7 mt-4">
      {/* Default product images */}
      <VariantImageRow
        title="Product Images (Default)"
        images={groupedImages.default}
        onAdd={(files) =>
          addProductImages(user.id, prodId, files, null).then(refreshData)
        }
        onDelete={(id) => deleteImage(id).then(refreshData)}
      />

      {/* Variant images */}
      {variants.map((variant) =>
        variant.name === "Default" ? (
          <p className="hidden"></p>
        ) : (
          <VariantImageRow
            key={variant.id}
            title={variant.name}
            images={groupedImages[variant.id] || []}
            onAdd={(files) =>
              addProductVariantImages(user.id, prodId, variant.id, files).then(
                loadData
              )
            }
            onDelete={(id) => deleteImage(id).then(loadData)}
          />
        )
      )}
    </div>
  );
}
