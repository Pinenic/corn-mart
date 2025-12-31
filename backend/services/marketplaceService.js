import { supabase } from "../supabaseClient.js";

export const getAllProducts = async ({ offset = 0, limit = 12 }) => {
  let hasMore = true;
  const from = offset * limit;
  const to = from + (limit - 1);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .range(from, to)
    .order("created_at", { ascending: false });
  if (prodError) throw new Error(`Error fetching products,`, prodError);

  if (products.length < limit) hasMore = false;

  const productsWithlocation = await Promise.all(
    products.map(async (product) => {
      const location = await productLocationHelper(product.store_id);
      return { ...product, location };
    })
  );
  return { productsWithlocation, hasMore };
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
    .select("*, subcategories(*)")
    .order("name", {ascending: true});
  if (error) throw new Error(`Error fetching categories, ${error}`);
  return data;
};

export const getSingleCategory = async (category) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*,subcategories(*, products(*))")
    .eq("slug", category);

  if (error) throw new Error("Error fetching the category", error);

  // console.log("maincat: ",category, "data: ",data); for debugging
  return data;
};

export const getProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*,subcategories(*, products(*))")
    .eq("slug", category);

  if (error) throw new Error("Error fetching the category", error);

  const organizedProducts = organizeProducts(data[0].subcategories);
  const productsWithlocation = await Promise.all(
    organizedProducts.map(async (product) => {
      const location = await productLocationHelper(product.store_id);
      return { ...product, location };
    })
  );
  return productsWithlocation;
};

export const getSubCategory = async (maincat, category) => {
  const Category = await getSingleCategory(maincat);
  const { data, error } = await supabase
    .from("subcategories")
    .select("*, products(*)")
    .eq("category_id", Category[0].id)
    .eq("slug", category);

  if (error) {
    throw new Error(error.message);
  }

  const revisedData = await Promise.all(
    data.map(async (subcat) => {
      const productsWithLocation = await Promise.all(
        (subcat.products || []).map(async (product) => {
          const location = await productLocationHelper(product.store_id);
          return {
            ...product,
            location,
          };
        })
      );

      return {
        ...subcat,
        products: productsWithLocation,
      };
    })
  );

  return revisedData;
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

    const productsWithlocation = await Promise.all(
    products.map(async (product) => {
      const location = await productLocationHelper(product.store_id);
      return { ...product, location };
    })
  );

  try {
    const results = Promise.all([categories, subcategories, productsWithlocation]);
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

async function productLocationHelper(storeId) {
  const { data, error } = await supabase
    .from("store_locations")
    .select("city, province")
    .eq("store_id", storeId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}
