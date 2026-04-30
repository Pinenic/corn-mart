"use client";

import { useEffect } from "react";
import {
  getLastClickedItem,
  clearLastClickedItem,
} from "@/utils/lastClickedItem";

export default function useRestoreLastItem(storageKey, ready) {
  useEffect(() => {
    console.log(ready);
    console.log(" storage key: ",storageKey)
    if (!ready) return;

    const id = getLastClickedItem(storageKey);
    console.log(id)
    if (!id) return;

    const el = document.getElementById(`item-${id}`);

    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
        console.log("targeting item:", id )

        clearLastClickedItem(storageKey);
      });
    }
  }, [ready, storageKey]);
}