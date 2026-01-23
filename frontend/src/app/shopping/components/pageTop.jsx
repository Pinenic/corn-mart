"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import { searchMarket } from "@/lib/marketplaceApi";
import CategoryNav from "./CategoryNav";
import MegaMenuCategories from "./MegaMenuCategories";
import { AutoBreadcrumb } from "./AutoBreadcrumb";

export default function PageTop({ Categories, setLoading, onResults }) {
  async function search(q) {
    try {
      const res = await searchMarket(q);
      return res.data;
    } catch (error) {
      return error.message;
    }
  }

  async function handleSearch(q) {
    try {
      setLoading(true);
      const res = await searchMarket(q);
      onResults(res.data[2]);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className=" w-full md:flex justify-between mt-3 px-2 pb-2 px-3 gap-2">
      <div className="hidden lg:inline py-2">
        <AutoBreadcrumb />
      </div>
      {/* <MegaMenuCategories categories={Categories} /> */}

      <SearchBar onQuery={search} onSearch={handleSearch} />
    </div>
  );
}
