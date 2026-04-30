// src/services/categoryService.js
// Categories and subcategories are global (not store-scoped),
// so no ownership check is needed — any authenticated user can read them.

import { supabaseAdmin } from "../config/supabase.js";

const categoryService = {
  // All categories with their subcategories nested
  async getAllWithSubs() {
    const { data: categories, error: catErr } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (catErr) throw catErr;

    const { data: subcategories, error: subErr } = await supabaseAdmin
      .from("subcategories")
      .select("id, category_id, name, slug")
      .order("name", { ascending: true });

    if (subErr) throw subErr;

    // Nest subcategories under their parent category
    return categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((s) => s.category_id === cat.id),
    }));
  },

  // Flat list of categories only (for filter dropdowns)
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Subcategories for a specific category
  async getSubcategories(categoryId) {
    const { data, error } = await supabaseAdmin
      .from("subcategories")
      .select("id, category_id, name, slug")
      .eq("category_id", categoryId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Single category by ID
  async getById(categoryId) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug")
      .eq("id", categoryId)
      .single();

    if (error || !data) return null;
    return data;
  },
};

export default categoryService;
