"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductControls from "../product/[slugAndId]/_components/ProductControls";
import { ProductImages } from "../product/[slugAndId]/_components/ProductImages";

export function ViewProductModal({
  open,
  onOpenChange,
  product,
  onSave,
  loading,
}) {
//   const [formData, setFormData] = useState({
//     name: "",
//     stock: 0,
//     price: 0,
//     low_stock_threshold: 0,
//   });
//   const [errors, setErrors] = useState({});

//   // Populate form when dialog opens
//   useEffect(() => {
//     if (open && product) {
//       setFormData({
//         name: product.name,
//         stock: product.stock,
//         price: product.price,
//         low_stock_threshold: product.low_stock_threshold,
//       });
//       setErrors({});
//     }
//   }, [open, product]);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     // Clear error for this field when user starts typing
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: null }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     }

//     if (formData.stock < 0) {
//       newErrors.stock = "Stock cannot be negative";
//     }

//     if (formData.price <= 0) {
//       newErrors.price = "Price must be greater than 0";
//     }

//     if (formData.low_stock_threshold < 0) {
//       newErrors.low_stock_threshold = "Threshold cannot be negative";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (validate()) {
//       onSave({
//         name: formData.name,
//         stock: Number(formData.stock),
//         price: Number(formData.price),
//         low_stock_threshold: Number(formData.low_stock_threshold),
//       });
//     }
//   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Variant</DialogTitle>
          <DialogDescription>
            Update variant details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* LEFT: HERO IMAGE */}
            <div className="space-y-4">
              <ProductImages images={product?.product_images} />
            </div>

            {/* RIGHT: PRODUCT INFO */}
            <div>
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <p className="text-3xl font-bold mt-2">
                ZMW {product.price.toFixed(2)}
              </p>

              <hr className="my-6" />

              <p className="text-gray-700">{product.description}</p>

              <hr className="my-6" />

              {/* Client component for variant + quantity + cart */}
              <ProductControls product={product} />
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
