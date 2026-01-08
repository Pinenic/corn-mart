"use client";

import { useEffect, useState } from "react";
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
  const [subcats, setSubCats] = useState([]);

  // ✅ reacts correctly when category changes
  useEffect(() => {
    setSubCats(category?.subcategories ?? []);
  }, [category?.id]);

  const handleCreate = () => {
    if (!newName.trim()) return;

    onCreate({
      name: newName,
      slug: generateSlug(newName),
      category_id: category.id,
    });

    setNewName("");
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {subcats.map((sub) => {
        const isSelected = selected?.name === sub.name;

        return (
          <Button
            key={sub.name}
            variant={isSelected ? "default" : "outline"}
            className="rounded-full px-4 py-1"
            onClick={() => onSelect(sub)}
          >
            {sub.name}
          </Button>
        );
      })}

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

          <Input
            placeholder="Subcategory name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
