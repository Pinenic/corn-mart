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
            Are you sure you want to delete <span className="font-semibold text-muted-foreground">{product.name}</span>? 
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