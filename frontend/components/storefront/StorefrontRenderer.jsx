"use client";
import { BLOCK_REGISTRY } from "./registry";

/**
 * Renders a store's configured blocks in order. `blocks` should already
 * be the *parsed* output of parseStoreConfig() — validated and filtered,
 * not the raw JSONB column.
 */
export function StorefrontRenderer({ store, blocks }) {
  return (
    <>
      {blocks.map((block, i) => {
        const Component = BLOCK_REGISTRY[block.type];
        if (!Component) return null; // defensive — parseStoreConfig already filters these out
        return <Component key={`${block.type}-${i}`} block={block} store={store} />;
      })}
    </>
  );
}
