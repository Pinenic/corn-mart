import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import StoreInfoCard from "./StoreInfoCard";

export function StoreHeader({ store }) {
  return (
    <div className="relative h-72 lg:h-96 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: `url(${store.bannerUrl})`,
        }}
      />
      <div className="relative flex items-center gap-4 px-6 py-4 bg-muted/80 backdrop-blur-sm">
        <Avatar className="h-16 w-16 border-2 border-white">
          <AvatarImage src={store?.avatarUrl || ""} alt="User avatar" />
        </Avatar>
        <div className="flex-1">
          <div className="flex-1">
            <h1 className="md:text-2xl font-semibold ">
              {store.name}
            </h1>
          </div>
          <div>
            <p className="text-xs md:text-sm">
              {store.followers} followers · {store.productsCount} products
            </p>
          </div>
          <p className="hidden md:flex text-xs lg:text-sm leading-relaxed">
            {store.description ||
              "This seller hasn’t added a description yet. Check out their products below!"}
          </p>
          <div className="hidden md:flex flex flex-wrap gap-4 text-xs lg:text-sm mt-1">
            <p>
              <span className="font-medium text-muted-foreground">Location:</span>{" "}
              {store.location || "Unknown"}
            </p>
            <p>
              <span className="font-medium  text-muted-foreground">Rating:</span> ⭐{" "}
              {store.rating || "4.8"} / 5
            </p>
            <p>
              <span className="font-medium  text-muted-foreground">Joined:</span>{" "}
              {store.joined || "2024"}
            </p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/80 text-white rounded-xl">
          Follow
        </Button>
      </div>
    </div>
  );
}
