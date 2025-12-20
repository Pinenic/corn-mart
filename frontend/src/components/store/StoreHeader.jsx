"use client"

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import StoreInfoCard from "./StoreInfoCard";
import FollowButton from "./FollowButton";
import { useEffect, useState } from "react";

export function StoreHeader({ store, refresh }) {
  const [storeData, setStoreData] = useState({})

  useEffect(()=>{
    if(!store.id){
      return
    }
    setStoreData(store)
  },[store])
  return (
    <div className="relative h-72 lg:h-96 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: `url(${storeData.bannerUrl})`,
        }}
      />
      <div className="relative flex items-center gap-4 px-6 py-4 bg-muted/80 backdrop-blur-sm">
        <Avatar className="h-16 w-16 border-2 border-white">
          <AvatarImage src={storeData?.avatarUrl || ""} alt="User avatar" />
        </Avatar>
        <div className="flex-1">
          <div className="flex-1">
            <h1 className="md:text-2xl font-semibold ">
              {storeData.name}
            </h1>
          </div>
          <div>
            <p className="text-xs md:text-sm">
              {storeData.followers} followers · {storeData.productsCount} products
            </p>
          </div>
          <p className="hidden md:flex text-xs lg:text-sm leading-relaxed">
            {storeData.description ||
              "This seller hasn’t added a description yet. Check out their products below!"}
          </p>
          <div className="hidden md:flex flex flex-wrap gap-4 text-xs lg:text-sm mt-1">
            <p>
              <span className="font-medium text-muted-foreground">Location:</span>{" "}
              {storeData.location || "Unknown"}
            </p>
            <p>
              <span className="font-medium  text-muted-foreground">Rating:</span> ⭐{" "}
              {storeData.rating || "4.8"} / 5
            </p>
            <p>
              <span className="font-medium  text-muted-foreground">Joined:</span>{" "}
              {new Date(storeData.joined).toLocaleDateString("en-GB", {
                        // day: "2-digit",
                        // month: "short",
                        year: "numeric",
                      })}
            </p>
          </div>
        </div>
        <FollowButton storeId={storeData.id} refresh={refresh}/>
      </div>
    </div>
  );
}
