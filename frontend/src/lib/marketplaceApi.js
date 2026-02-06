import { fetchApi } from "./apiClient";

export async function getAllProducts(offset, limit) {
    return fetchApi(`/api/marketplace?limit=${limit? limit : 12}&offset=${offset}`);
}

export async function getProductsByCategory(cat){
    return fetchApi(`/api/marketplace/${cat}/products`)
}

export async function getProductById(id){
    return fetchApi(`/api/marketplace/${id}`);
}

export async function searchMarket (query, storeId = null) {
    return fetchApi(`/api/marketplace/search?q=${query}&sid=${storeId ? storeId : null}`);
}

export async function getCategories () {
    return fetchApi(`/api/marketplace/categories`)
}

export async function getSingleCategoryWP(slug) {
    return fetchApi(`/api/marketplace/categories/${slug}`)
}

export async function getSubcatProducts(maincat, slug) {
    return fetchApi(`/api/marketplace/categories/${maincat}/${slug}`)
}
