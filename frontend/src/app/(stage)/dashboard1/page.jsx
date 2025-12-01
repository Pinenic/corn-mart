// "use client";
// import { useMemo, useState } from "react";
// import Link from "next/link";
// import {
//   LayoutDashboard,
//   ShoppingBag,
//   Package,
//   BarChart2,
//   Settings,
//   Edit,
//   Trash2,
//   Filter,
// } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { usePathname } from "next/navigation";
// import { Label } from "@/components/ui/label";

// const navItems = [
//   { href: "/store/dashboard", icon: LayoutDashboard },
//   { href: "/store/orders", icon: ShoppingBag },
//   { href: "/store/inventory", icon: Package },
//   { href: "/store/analytics", icon: BarChart2 },
//   { href: "/store/settings", icon: Settings },
// ];

// function NavMobile() {
//   const pathname = usePathname();
//   return (
//     <nav className="max-w-7xl mx-auto fixed top-19 left-0 right-0 border-b flex py-2">
//       <div className="flex w-1/4 justify-around">
//         {navItems.map(({ href, icon: Icon }) => (
//           <Link
//             key={href}
//             href={href}
//             className={`flex flex-col items-center text-xs ${
//               pathname === href ? "text-blue-600" : "text-gray-500"
//             }`}
//           >
//             <Icon className="w-5 h-5" />
//           </Link>
//         ))}
//       </div>
//     </nav>
//   );
// }

//  export default function Page(props) {
// //   const [selectedCategories, setSelectedCategories] = useState([]);
// //   const [selectedStatuses, setSelectedStatuses] = useState([]);
// //   const [products, setProducts] = useState([
// //     { id: 1, name: "Blue Hoodie", stock: 32, price: 35, status: "Active" },
// //     { id: 2, name: "Leather Wallet", stock: 8, price: 50, status: "Low Stock" },
// //     {
// //       id: 3,
// //       name: "Running Shoes",
// //       stock: 0,
// //       price: 60,
// //       status: "Out of Stock",
// //     },
// //   ]);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [appliedFilters, setAppliedFilters] = useState({
// //     categories: [],
// //     statuses: [],
// //   });

// //   const itemsPerPage = 5;
// //   const categories = [
// //     "Apparel",
// //     "Footwear",
// //     "Accessories",
// //     "Electronics",
// //     "Home & Kitchen",
// //     "Beauty",
// //     "Toys & Games",
// //     "Sports",
// //     "Outdoor",
// //     "Groceries",
// //     "Stationery",
// //     "Jewelry",
// //     "Bags",
// //     "Baby",
// //     "Pet Supplies",
// //   ];
// //   const statuses = ["Active", "Low Stock", "Out of Stock"];

// //   const filteredProducts = useMemo(() => {
// //     return products.filter((p) => {
// //       const matchSearch = p.name
// //         .toLowerCase()
// //         .includes(searchTerm.toLowerCase());
// //       const matchCategory =
// //         appliedFilters.categories.length === 0 ||
// //         appliedFilters.categories.includes(p.category);
// //       const matchStatus =
// //         appliedFilters.statuses.length === 0 ||
// //         appliedFilters.statuses.includes(p.status);
// //       return matchSearch && matchCategory && matchStatus;
// //     });
// //   }, [searchTerm, products, appliedFilters]);

// //   const handleEdit = (product) => {
// //     setSelectedProduct(product);
// //     setEditModalOpen(true);
// //   };

// //   const handleDelete = (product) => {
// //     setSelectedProduct(product);
// //     setDeleteModalOpen(true);
// //   };

// //   const handleConfirmDelete = () => {
// //     // TODO: delete from Supabase
// //     console.log("Deleted:", selectedProduct);
// //     setDeleteModalOpen(false);
// //   };

// //   const handleSaveChanges = () => {
// //     console.log("Updated:", selectedProduct);
// //     setEditModalOpen(false);
// //   };

// //   const toggleCategory = (cat) => {
// //     setSelectedCategories((prev) =>
// //       prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
// //     );
// //   };

// //   const toggleStatus = (status) => {
// //     setSelectedStatuses((prev) =>
// //       prev.includes(status)
// //         ? prev.filter((s) => s !== status)
// //         : [...prev, status]
// //     );
// //   };

// //   const applyFilters = () => {
// //     setAppliedFilters({
// //       categories: selectedCategories,
// //       statuses: selectedStatuses,
// //     });
// //     setFiltersOpen(false);
// //   };

// //   const clearFilters = () => {
// //     setSelectedCategories([]);
// //     setSelectedStatuses([]);
// //     setAppliedFilters({ categories: [], statuses: [] });
// //   };
//   return (
//     <div className="max-w-7xl mx-auto flex flex-col">
//       {/* <NavMobile />
//       <div className="flex mt-20">
//         <div className="flex flex-col items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             className="flex items-center gap-2"
//           >
//             <Filter className="w-4 h-4" /> Filters
//           </Button>
//           <div className="mt-4 space-y-6 p-4">
//             <div>
//               <h4 className="font-semibold mb-2">Categories</h4>
//               {categories.length > 0 ? (
//                 categories.map((cat) => (
//                   <div key={cat} className="flex items-center space-x-2 mb-1">
//                     <Checkbox
//                       id={cat}
//                       checked={selectedCategories.includes(cat)}
//                       onCheckedChange={() => toggleCategory(cat)}
//                     />
//                     <Label htmlFor={cat}>{cat}</Label>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-sm text-gray-500">No categories yet</p>
//               )}
//             </div>

//             <div>
//               <h4 className="font-semibold mb-2">Status</h4>
//               {statuses.map((status) => (
//                 <div key={status} className="flex items-center space-x-2 mb-1">
//                   <Checkbox
//                     id={status}
//                     checked={selectedStatuses.includes(status)}
//                     onCheckedChange={() => toggleStatus(status)}
//                   />
//                   <Label htmlFor={status}>{status}</Label>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="mt-6 flex justify-between">
//             <Button
//               className="text-red-600 border-red-400 hover:bg-red-50"
//               variant="outline"
//               onClick={clearFilters}
//             >
//               Clear
//             </Button>
//             <Button
//               className="bg-blue-600 hover:bg-blue-500 text-white"
//               onClick={applyFilters}
//             >
//               Apply
//             </Button>
//           </div>

//           {(appliedFilters.categories.length > 0 ||
//             appliedFilters.statuses.length > 0) && (
//             <div className="flex flex-wrap gap-1 text-sm text-blue-600">
//               {appliedFilters.categories.map((cat) => (
//                 <span
//                   key={cat}
//                   className="px-2 py-0.5 bg-blue-100 rounded-md text-blue-700"
//                 >
//                   {cat}
//                 </span>
//               ))}
//               {appliedFilters.statuses.map((st) => (
//                 <span
//                   key={st}
//                   className="px-2 py-0.5 bg-blue-100 rounded-md text-blue-700"
//                 >
//                   {st}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//       </div> */}
//     </div>
//   );
// }
import React from "react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata = {
  title:
    "Corn Mart | Store Dashboard",
  description: "The seller Dashboard for Corn Mart",
};

export default function Ecommerce() {
  return (
    <>
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
    </>
  );
}
