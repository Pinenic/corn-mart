import { supabase } from "../supabaseClient.js";

export const getAllProducts = async ({ offset = 0, limit = 12 }) => {
  let hasMore = true;
  const from = offset * limit;
  const to = from + (limit - 1);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .range(from, to)
    .order("created_at", { ascending: true });
  if (prodError) throw new Error(`Error fetching products,`, prodError);

  if(products.length < limit) hasMore = false;
  return {products, hasMore};
};

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("id", id);

  if (error) throw new Error(`${error}`);

  return data;
};

export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*, subcategories(*)");
  if (error) throw new Error(`Error fetching categories, ${error}`);
  return data;
};

export const getSingleCategory = async (category) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*,subcategories(*, products(*))")
    .eq("slug", category);

  if (error) throw new Error("Error fetching the category", error);
  return data;
};

export const getProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*,subcategories(*, products(*))")
    .eq("slug", category);

  if (error) throw new Error("Error fetching the category", error);

  const organizedProducts = organizeProducts(data[0].subcategories);
  return organizedProducts;
};

export const getSubCategory = async (category) => {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*, products(*)")
    .eq("slug", category);

  if (error) throw new Error("Error fetching the category", error);
  return data;
};

export const searchDb = async (query) => {
  const searchResults = await searchHelper(query);
  if (!searchResults) throw new Error(`Failed to search db`);
  return searchResults;
};

/*
 * Helper functions
 */

async function searchHelper(query) {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .ilike("slug", `%${query}%`);
  const { data: subcategories, error: subcatError } = await supabase
    .from("subcategories")
    .select("*")
    .ilike("slug", `%${query}%`);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query}%`);

  try {
    const results = Promise.all([categories, subcategories, products]);
    return results;
  } catch (error) {
    console.log("Error fetching results", error);
  }
}

function organizeProducts(arr) {
  let products = [];
  for (let index = 0; index < arr.length; index++) {
    products = [...products, ...arr[index].products];
  }
  return products;
}
