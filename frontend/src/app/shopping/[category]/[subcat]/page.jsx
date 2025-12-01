"use client";
import { useParams } from "next/navigation";
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
// import data from "./data.json";
import ProductCard from "../../components/ProductCard";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { AutoBreadcrumb } from "../../components/AutoBreadcrumb";
// import SearchBar from "./components/SearchBar";
import { getSubcatProducts, searchMarket } from "@/lib/marketplaceApi";
import { Spinner } from "@/components/ui/spinner";

const Categories = [
  "Electronics",
  "Home & Garden",
  "Fashion",
  "Mortor",
  "Industrial",
  "Toys & Games",
];

export default function Page() {
  const {subcat} = useParams();
  const [searchQ, setSearchQ] = useState("");
  const [view, setView] = useState("Grid");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [page, setPage] = useState(1);
  const totalPages = 10;

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await getSubcatProducts(decodeURIComponent(subcat));
      setProducts(res.data[0].products);
      setLoading(false);
    } catch (error) {
      console.error("failed to fetch products", error);
    }
  }

  async function search(q) {
    try {
      const res = await searchMarket(q);
      return res.data
    } catch (error) {
      return error.message;
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex">
      <main className="w-full">
        <div className="flex justify-between px-3 mt-5">
          <AutoBreadcrumb />
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
              ? "grid grid-cols-4 gap-6 p-4 h-[70vh] overflow-y-scroll mt-4"
              : "flex flex-col h-[70vh] overflow-y-scroll mt-4 "
          }
        >
          {/* {data.products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} view={view} />
            </div>
          ))} */}
          {loading ? (
            <>
              <div className="flex w-full items-center justify-center min-h-[50vh]">
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
        <div className="flex w-full justify-center gap-8 mt-2">
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(1)}
              disabled={page == 1}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page == 1}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page == totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => setPage(totalPages)}
              disabled={page == totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

