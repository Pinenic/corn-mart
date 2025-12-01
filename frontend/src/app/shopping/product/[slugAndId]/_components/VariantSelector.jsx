"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function VariantSelector({ variants, chooseVariant }) {
    const [size, setSize] = useState(null);
    const [color, setColor] = useState(null);

    const handleClick = (variant) => {
        setSize(variant);
        chooseVariant(variant);
    }

    return (
        <div className="space-y-6">
            {/* Sizes */}
            <div>
                <Label className="font-medium">Variants</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                    {variants.map((sz) => (
                        <Button
                            key={sz.id}
                            variant={size === sz ? "default" : "outline"}
                            onClick={() => handleClick(sz)}
                            className="px-5 py-2"
                        >
                            {sz.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div>
                <Label className="font-medium">Color</Label>
                <div className="flex gap-2 mt-2">
                    {variants.colors?.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => setColor(c.value)}
                            className={`w-10 h-10 rounded-full border-2 ${
                                color === c.value ? "ring-2 ring-primary" : ""
                            }`}
                            style={{ backgroundColor: c.value }}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    );
}
