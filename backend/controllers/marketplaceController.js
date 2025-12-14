import { success } from "zod";
import { getAllCategories, getAllProducts, getProductById, getProductsByCategory, getSingleCategory, getSubCategory, searchDb } from "../services/marketplaceService.js";

export const getProducts = async (req, res) => {
    
    try {
        const {offset, limit} = req.query;
        const response = await getAllProducts({offset, limit});
        res.status(201).json({success: true, data:response});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getSingleProductById = async (req, res) => {
    
    try {
        const {id} = req.params;
        const response = await getProductById(id);
        res.status(201).json({success: true, data:response});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getAllCategoryProducts = async (req, res) => {
    
    try {
        const {category} = req.params;
        const response = await getProductsByCategory(category);
        res.status(201).json({success: true, data:response});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getCategories = async (req, res) => {
    
    try {
        const response = await getAllCategories();
        res.status(201).json({success: true, data:response});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: `error fetching categories. ${error}`});
    }
}

export const getCategory = async (req, res) => {
    try {
        const {category} = req.params;
        const response = await getSingleCategory(category);
        res.status(201).json({success:true, data:response})
    } catch (error) {
        res.status(500).json({success:false, message:error.message});
    }
}

export const getSingleSubCategory = async (req, res) => {
    try {
        const {subcat} = req.params;
        const response = await getSubCategory(subcat);
        res.status(201).json({success:true, data:response})
    } catch (error) {
        res.status(500).json({success:false, message:error.message});
    }
}

export const searchMarket = async (req, res) => {
    try {
        const {q} = req.query;
        const response = await searchDb(q);
        res.status(201).json({success: true, data: response})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message: error});
    }
}