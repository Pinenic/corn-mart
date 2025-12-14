import { useCart } from "@/store/useCart";
import { ShoppingCart } from "lucide-react";

function CartBadge() {
  const itemCount = useCart((state) => state.itemCount);

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6" />
      {/* {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )} */}
    </div>
  );
}

export default CartBadge;