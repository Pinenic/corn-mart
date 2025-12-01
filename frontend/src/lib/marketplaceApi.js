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

export async function searchMarket (query) {
    return fetchApi(`/api/marketplace/search?q=${query}`);
}

export async function getCategories () {
    return fetchApi(`/api/marketplace/categories`)
}

export async function getSingleCategoryWP(slug) {
    return fetchApi(`/api/marketplace/categories/${slug}`)
}

export async function getSubcatProducts(slug) {
    return fetchApi(`/api/marketplace/categories/${slug}/subcategory`)
}
