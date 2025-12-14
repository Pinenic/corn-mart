"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Filter } from "lucide-react";

export default function ProductsTable({ products, searchTerm }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    statuses: [],
  });

  const itemsPerPage = 5;
  const categories = [...new Set(products.map((p) => p.category))];
  const statuses = ["Active", "Low Stock", "Out of Stock"];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory =
        appliedFilters.categories.length === 0 ||
        appliedFilters.categories.includes(p.category);
      const matchStatus =
        appliedFilters.statuses.length === 0 ||
        appliedFilters.statuses.includes(p.status);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [searchTerm, products, appliedFilters]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "stock") return a.stock - b.stock;
    return a.name.localeCompare(b.name);
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: delete from Supabase
    console.log("Deleted:", selectedProduct);
    setDeleteModalOpen(false);
  };

  const handleSaveChanges = () => {
    console.log("Updated:", selectedProduct);
    setEditModalOpen(false);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const applyFilters = () => {
    setAppliedFilters({
      categories: selectedCategories,
      statuses: selectedStatuses,
    });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setAppliedFilters({ categories: [], statuses: [] });
  };

  return (
    <div className="w-full">
      {/* Filters + Sort Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-6 p-4">
                <div>
                  <h4 className="font-semibold mb-2">Categories</h4>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2 mb-1">
                        <Checkbox
                          id={cat}
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <Label htmlFor={cat}>{cat}</Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories yet</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2 mb-1">
                      <Checkbox
                        id={status}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                      />
                      <Label htmlFor={status}>{status}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button
                  className="text-red-600 border-red-400 hover:bg-red-50"
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={applyFilters}>
                  Apply
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {(appliedFilters.categories.length > 0 ||
            appliedFilters.statuses.length > 0) && (
            <div className="flex flex-wrap gap-1 text-sm text-blue-600">
              {appliedFilters.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 bg-blue-100 rounded-md text-blue-700"
                >
                  {cat}
                </span>
              ))}
              {appliedFilters.statuses.map((st) => (
                <span
                  key={st}
                  className="px-2 py-0.5 bg-blue-100 rounded-md text-blue-700"
                >
                  {st}
                </span>
              ))}
            </div>
          )}
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">Sort by: {sortBy}</SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="p-4">{p.name}</TableCell>
                <TableCell className="p-4">{p.stock}</TableCell>
                <TableCell className="p-4">K{p.price}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : p.status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="p-4 text-right flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(p)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 lg:hidden">
        {paginatedProducts.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-white shadow-sm rounded-xl border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-base">{p.name}</h3>
                <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                <p className="text-sm text-gray-600 mt-1">Price: K{p.price}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  p.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : p.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.status}
              </span>
            </div>
            <div className="flex justify-end mt-3 gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(p)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <p className="text-sm">
          Page {currentPage} of {totalPages}
        </p>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={selectedProduct.price}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) =>
                    setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedProduct?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-500" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
