"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/utils/slug";

export default function SubcategorySelector({
  category,
  selected,
  onSelect,
  onCreate,
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate({
      name: newName,
      slug: generateSlug(newName),
      category_id: category.id,
    }); // parent handles DB insert
    setNewName("");
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Subcategory buttons */}
      {category.subcategories?.map((sub) => {
        const isSelected =
          JSON.stringify(selected) == JSON.stringify(sub) ? true : false;

        return (
          <Button
            key={sub.name}
            variant={isSelected ? "default" : "outline"}
            className={`rounded-full px-4 py-1`}
            onClick={() => onSelect(sub)}
          >
            {sub.name}
          </Button>
        );
      })}

      {/* Add new subcategory button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="rounded-full px-4 py-1">
            + Add Subcategory
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <Input
              placeholder="Subcategory name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
