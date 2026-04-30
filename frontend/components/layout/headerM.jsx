import { Search } from "lucide-react";

export default function HeaderMain() {
  return (
    <div className="flex py-2">
      <div className="flex gap-8 ">
        <h1 className="text-accent text-4xl font-bold">Corn Mart</h1>
        <div className="flex border border-2 border-secondary rounded-xl items-center px-2 w-md justify-between">
          <input type="text" placeholder="Search..." id="search" />
          <Search className="p-1" />
        </div>
      </div>
      <div className="flex">
        
      </div>
    </div>
  );
}
