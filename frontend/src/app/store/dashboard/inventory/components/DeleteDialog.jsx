import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

// Example usage component
export default function ProductDeleteExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, name: 'Wireless Mouse', stock: 45, price: 29.99 },
    { id: 2, name: 'Mechanical Keyboard', stock: 23, price: 89.99 },
    { id: 3, name: 'USB-C Cable', stock: 156, price: 12.99 }
  ]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const confirmDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
    setIsOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        
        <div className="space-y-3">
          {products.map(product => (
            <div 
              key={product.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  Stock: {product.stock} • ${product.price}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDelete(product)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-gray-500 py-8">No products available</p>
        )}

        <ProductDeleteDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          product={selectedProduct}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}

// Reusable delete confirmation dialog
export function ProductDeleteDialog({ open, onOpenChange, product, onConfirm, loading }) {
  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{product.name}</span>? 
            This action cannot be undone and will permanently remove this product from your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading? "Deleting...":"Delete Product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}