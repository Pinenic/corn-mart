"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Info, Variants, Media } from "./InfoTab";
import { useEffect, useState } from "react";
import {
  uploadProductImages,
  deleteImage,
  setImageAsThumbnail,
} from "@/lib/inventoryApi";
// import { useQuery } from "@tanstack/react-query";
// import { fetchProductById } from "@/lib/api";

export default function ProductDetailsPanel({ product, reloadList, onClose }) {
  //   const { data, isLoading } = useQuery({
  //     queryKey: ["product", product.id],
  //     queryFn: () => fetchProductById(product.id),
  //     enabled: !!product?.id,
  //   });

  const [details, setDetails] = useState(product);
  useEffect(() => {
    setDetails(product);
  }, [product]);

  return (
    <div className="h-full flex flex-col bg-card px-4 border-l h-96">
      <div className="flex items-center justify-between py-3">
        <h2 className="font-semibold text-lg">{details.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <TabsList className="border-b px-4 py-2 bg-muted/20 w-full">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          ) : ( */}
          <>
            <TabsContent value="info">
              <Info prod={details} reload={reloadList} />
            </TabsContent>
            <TabsContent value="variants">
              <Variants
                vars={details.product_variants}
                prodId={details.id}
                reload={reloadList}
              />
            </TabsContent>
            <TabsContent value="media">
              <Media prodId={details.id} />
            </TabsContent>
          </>
          {/* )} */}
        </div>
      </Tabs>
    </div>
  );
}
