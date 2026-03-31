import { Product } from '../models/Product.js';

/* GET /api/products?plantId=xxx  — list products for a plant */
export const listProducts = async (req, res) => {
  try {
    const { plantId } = req.query;
    const filter = plantId ? { plantId } : {};
    const products = await Product.find(filter).sort({ createdAt: 1 });
    return res.json(products);
  } catch (err) {
    console.error('List products error', err);
    return res.status(500).json({ message: 'Failed to load products' });
  }
};

/* GET /api/products/:id */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load product' });
  }
};

/* POST /api/products  — create a product (auth required) */
export const createProduct = async (req, res) => {
  const { plantId, name, description, price, image, type } = req.body;
  if (!plantId || !name || price == null) {
    return res.status(400).json({ message: 'plantId, name and price are required' });
  }
  try {
    const product = await Product.create({ plantId, name, description, price, image, type });
    return res.status(201).json(product);
  } catch (err) {
    console.error('Create product error', err);
    return res.status(500).json({ message: 'Failed to create product' });
  }
};

/* PUT /api/products/:id  — update a product */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update product' });
  }
};

/* DELETE /api/products/:id */
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete product' });
  }
};
