"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, LayoutDashboard, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
// import data from "./data.json";
import ProductCard from "./ProductCard";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
// import CategorySidebar from "./components/CategorySidebar";
import { AutoBreadcrumb } from "./AutoBreadcrumb";
import SearchBar from "./SearchBar";
import { getAllProducts, searchMarket } from "@/lib/marketplaceApi";
import { Spinner } from "@/components/ui/spinner";
import PageTop from "./pageTop";

const Categories = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Mortor",
  "Industrial",
  "Toys & Games",
];

export default function SearchResultsGrid({initialProducts, loading, title}) {
  const { ref, inView } = useInView()
  const [view, setView] = useState("Grid");
  const [products, setProducts] = useState(initialProducts);
//   const [loading, setLoading] = useState(false);
  const views = [
    {
      name: "List",
      icon: <List />,
    },
    {
      name: "Grid",
      icon: <LayoutDashboard />,
    },
   ];

//   const [page, setPage] = useState(1);
//   const totalPages = 10;

// //   async function fetchProducts() {
// //     try {
// //       setLoading(true);
// //       const res = await getAllProducts(0);
// //       setProducts(res.data);
// //       setLoading(false);
// //     } catch (error) {
// //       console.error("failed to fetch products", error);
// //     }
// //   }

//   async function fetchMoreProducts() {
//     try {
//       const res = await getAllProducts((page-1)+1);
//       setProducts([...products,...res.data]);
//     } catch (error) {
//       console.error("failed to fetch products", error);
//     }
//   }

//   async function search(q) {
//     try {
//       const res = await searchMarket(q);
//       return res.data
//     } catch (error) {
//       return error.message;
//     }
//   }

//   useEffect(() => {
//     if(inView){
//       setPage(page+1);
//       fetchMoreProducts();
//     }
//     // fetchProducts();
//   }, [inView]);

  return (
    <div className="flex">
      {/* <div className="h-[90vh] w-96 border-2">
        <CategorySidebar />
      </div> */}
      <main className="w-full">

        <div className="flex justify-between px-3 mt-5">
          {title ? (<h2>{title}</h2>) : <AutoBreadcrumb />}
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} size={"sm"}>
                  <span>Sort</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Categories.map((cat) => (
                  <DropdownMenuItem>{cat}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} size={"sm"}>
                  <span>{view} view</span>
                  {view == "Grid" ? <LayoutDashboard /> : <List />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {views.map((vu) => (
                  <DropdownMenuItem
                    key={vu.name}
                    onClick={() => setView(vu.name)}
                  >
                    {vu.name} {vu.icon}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={
            view == "Grid"
              ? "grid grid-cols-4 gap-6 p-4 overflow-y-scroll mt-4"
              : "flex flex-col overflow-y-scroll mt-4 "
          }
        >
          {loading ? (
            <>
              <div className="flex w-full items-center justify-center min-h-[100vh]">
                {/* <p className="text-gray-600 animate-pulse">Loading session...</p> */}
                <Spinner className="size-8 text-blue-500" />
              </div>
            </>
          ) : (
            products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} view={view} />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
