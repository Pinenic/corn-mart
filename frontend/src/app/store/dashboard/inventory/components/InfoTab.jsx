// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import Image from "next/image";
// import { CategoryTabs } from "./CategoryTabs";
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
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

export function Info({ prod, reload }) {
  const [formData, setFormData] = useState({});
  const [Loading, setLoading] = useState(false);
  const [message, setMeassage] = useState("");

  const userId = "fa31a398-aaa8-4bc3-aeb4-4332684f116c";

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
        userId,
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleSubmit}
      >
        {Loading ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}

export function Variants({ prodId, reload}) {
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
    stock,
    price,
    low_stock_threshold,
  }) => {
    try {
      setLoading(true);
      const res = await createVariant({
        productId: prodId,
        name,
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
    stock,
    price,
    low_stock_threshold,
  }) => {
    try {
      setLoading(true);
      const res = await updateVariant(selectedVariant.id, {
        name,
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
        <Button onClick={() => setIsOpen(true)}>
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
          <div className="flex items-center justify-center min-h-[20vh]">
            {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
            <Spinner className="size-8 text-blue-500" />
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
                  <Switch
                    id="active"
                    // checked={formData.is_active}
                    // onCheckedChange={() => toggle("is_active")}
                  />
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

export function Media({ prodId, maxFiles = 4, maxSizeMB = 5 }) {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [imgloading, setImgLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const userId = "fa31a398-aaa8-4bc3-aeb4-4332684f116c";

  async function loadImages() {
    try {
      setImgLoading(true);
      const data = await getProductImages(prodId);
      console.log(data);
      setImages(data.data);
      setImgLoading(false);
    } catch (err) {
      console.error(err.message);
    }
  }
  useEffect(() => {
    loadImages();
  }, [prodId]);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      return "File must be an image";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  };

  const onUpload = useCallback(async (newImages) => {
    const newFiles = newImages.map((img) => img.file);
    console.log("onUpload fired with", newImages.length, "images", newFiles);
  
    if (newFiles.length > 0) {
      const { data } = await uploadProductImages(
        userId,
        prodId,
        newFiles,
        0
      );
      console.log("Uploaded:", data);
    }
  });
  

  const isUploadingRef = useRef(false);

const processFiles = useCallback((files) => {
  console.log("processFiles fired");
  const fileArray = Array.from(files);
  const readers = [];
  const newImages = [];

  fileArray.forEach((file) => {
    const reader = new FileReader();
    readers.push(
      new Promise((resolve) => {
        reader.onload = (e) => {
          newImages.push({
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            file,
          });
          resolve();
        };
      })
    );
    reader.readAsDataURL(file);
  });

  Promise.all(readers).then(async () => {
    if (isUploadingRef.current) {
      console.warn("Skipped duplicate upload");
      return;
    }

    isUploadingRef.current = true;
    console.log("onUpload fired once with", newImages.length, "images");

    setImages((prev) => [...prev, ...newImages]);
    await onUpload?.(newImages);
    isUploadingRef.current = false;
  });
}, [onUpload]);
  

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = async(id) => {
    const res = await deleteImage(id);
    if(!res?.success) toast("failed to delete image", res.message);
    if(res?.success) loadImages();
    toast.success("image deleted", res.message);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        {/* Image Grid */}
        {imgloading ? (
          <>
            <div className="flex items-center justify-center min-h-[20vh]">
              {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
              <Spinner className="size-8 text-blue-500" />
            </div>
          </>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images?.map((image) => (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                >
                  <img
                    src={image.image_url}
                    alt={image.name || "Uploaded image"}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-700 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {image.name || "Untitled"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !error && (
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No images uploaded yet</p>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-4">
            <div
              className={`
              p-4 rounded-full transition-colors
              ${isDragging ? "bg-blue-100" : "bg-gray-200"}
            `}
            >
              <Upload
                className={`w-8 h-8 ${
                  isDragging ? "text-blue-500" : "text-gray-500"
                }`}
              />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragging ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>

            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files, up to {maxSizeMB}MB each
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <LoadingOverlay show={loading}/>
      </div>
    </div>
  );
}


export function InfoTab({ prod }) {
  const [activeCategory, setActiveCategory] = useState("info");
  if (prod == {})
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <p>No product selected</p>
      </div>
    );
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {prod?.name || "No product selected"}
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        {activeCategory == "info" ? (
          <Info prod={prod} />
        ) : activeCategory == "variants" ? (
          <Variants prod={prod} />
        ) : (
          <Media prod={prod} />
        )}
      </div>
    </div>
  );
}
