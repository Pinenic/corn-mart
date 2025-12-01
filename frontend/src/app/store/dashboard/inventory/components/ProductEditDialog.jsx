import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Example usage component
export default function ProductEditExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState({
    id: 1,
    name: 'Wireless Mouse',
    stock: 45,
    price: 29.99,
    low_stock_threshold: 10
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Current Product</h2>
        <div className="space-y-2 text-sm mb-4">
          <p><span className="font-medium">Name:</span> {product.name}</p>
          <p><span className="font-medium">Stock:</span> {product.stock}</p>
          <p><span className="font-medium">Price:</span> ${product.price}</p>
          <p><span className="font-medium">Low Stock Alert:</span> {product.low_stock_threshold}</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>Edit Product</Button>

        <ProductEditDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          product={product}
          onSave={(updatedProduct) => {
            setProduct(updatedProduct);
            setIsOpen(false);
          }}
        />
      </div>
    </div>
  );
}

// Reusable dialog component
export function ProductEditDialog({ open, onOpenChange, product, onSave, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    price: 0,
    low_stock_threshold: 0
  });
  const [errors, setErrors] = useState({});

  // Populate form when dialog opens
  useEffect(() => {
    if (open && product) {
      setFormData({
        name: product.name,
        stock: product.stock,
        price: product.price,
        low_stock_threshold: product.low_stock_threshold
      });
      setErrors({});
    }
  }, [open, product]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (formData.low_stock_threshold < 0) {
      newErrors.low_stock_threshold = 'Threshold cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave({
        name: formData.name,
        stock: Number(formData.stock),
        price: Number(formData.price),
        low_stock_threshold: Number(formData.low_stock_threshold)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Variant</DialogTitle>
          <DialogDescription>
            Update variant details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter Variant name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                placeholder="0"
              />
              {errors.low_stock_threshold && (
                <p className="text-sm text-red-500">{errors.low_stock_threshold}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
            {loading ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}