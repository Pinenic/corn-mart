"use client";
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCategories, getSingleCategoryWP } from "@/lib/marketplaceApi";

export default function CategorySidebar() {
  const { category } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data);
      arrangeSubcats(res.data);
      setLoading(false);
    } catch (error) {
      console.log("something wnet wrong,", error);
      setLoading(false);
    }
  };

  const arrangeSubcats = (catz) => {
    setSubcategories(catz.map((cat) => cat.subcategories));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {category ? (
        <CategoryLevelSidebar category={category} subcats={subcategories} />
      ) : (
        <TopLevelSidebar categories={categories} loading={loading} />
      )}
    </div>
  );
}

function TopLevelSidebar({ categories, loading }) {
  return (
    <div className=" w-fit pr-4">
      <h2 className="text-lg font-semibold mb-3">Shop By Category</h2>
      {loading && (
        <div className="flex flex-col gap-3 mt-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="flex-1 h-2 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      <div className=" w-fit pr-4">
        {categories.map((cat, i) => (
          <div key={i} className="mb-4">
            <Link
              href={`/shopping/${cat.slug}`}
              className="font-medium text-sm mb-2"
            >
              {cat.name}
            </Link>
            <div className="flex flex-col gap-1 pl-2">
              {cat.subcategories.map((s, j) => (
                <Link
                  key={j}
                  href={`/shopping/${cat.slug}/${s.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryLevelSidebar({ category, subcats }) {
  const [subcategories, setSubs] = useState([]);
  const getSubs = async () => {
    const res = await getSingleCategoryWP(decodeURIComponent(category));
    setSubs(res.data[0].subcategories);
  };
  useEffect(() => {
    getSubs();
  }, []);
  return (
    <div className=" w-64 pr-4">
      <h2>
        {category.charAt(0).toUpperCase() +
          decodeURIComponent(category.slice(1).replace(/-/g, " "))}
      </h2>

      <div className=" w-64 pr-4">
        <div className="flex flex-col gap-1 pl-2">
          {subcategories.map((s, j) => (
            <Link
              key={j}
              href={`/shopping/${category}/${s.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
