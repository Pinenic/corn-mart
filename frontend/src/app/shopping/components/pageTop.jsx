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

export default function PageTop({
  Categories,
  setLoading,
  onResults,
}) {
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
    <div className=" w-full flex justify-between p-2 px-3 gap-2">
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} size={"sm"}>
            <span>All Categories</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Categories.map((cat) => (
            <DropdownMenuItem>{cat}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}
      {/* <CategoryNav categories={Categories}/> */}
      <MegaMenuCategories categories={Categories} />

      {/* <div className="relative w-1/3 rounded-lg">
      <Search className="absolute bg-primary hover:bg-primary/90 text-white h-full w-15 p-1 left-[86%] rounded-r-lg" />
      <Input
        value={searchQ}
        onChange={(e) => setSearchQ(e.target.value)}
        placeholder="Search"
      />
    </div> */}<SearchBar onQuery={search} onSearch={handleSearch} />
    </div>
  );
}
