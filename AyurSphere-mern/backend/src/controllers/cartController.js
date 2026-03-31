import { Cart } from '../models/Cart.js';

/* helper – get or create cart for a user */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

/* helper – return populated cart as JSON */
const populatedCart = async (userId) => {
  return Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: { path: 'plantId', select: 'plantName imagePath' },
  });
};

/* GET /api/cart */
export const getCart = async (req, res) => {
  try {
    const cart = await populatedCart(req.user.id);
    return res.json(cart || { user: req.user.id, items: [] });
  } catch (err) {
    console.error('Get cart error', err);
    return res.status(500).json({ message: 'Failed to load cart' });
  }
};

/* POST /api/cart/add  — body: { productId, quantity } */
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required' });

  try {
    const cart = await getOrCreateCart(req.user.id);
    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const updated = await populatedCart(req.user.id);
    return res.json(updated);
  } catch (err) {
    console.error('Add to cart error', err);
    return res.status(500).json({ message: 'Failed to add to cart' });
  }
};

/* PATCH /api/cart/update  — body: { productId, quantity } */
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity == null) {
    return res.status(400).json({ message: 'productId and quantity are required' });
  }

  try {
    const cart = await getOrCreateCart(req.user.id);
    const idx = cart.items.findIndex((i) => i.product.toString() === productId);

    if (idx < 0) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();
    const updated = await populatedCart(req.user.id);
    return res.json(updated);
  } catch (err) {
    console.error('Update cart error', err);
    return res.status(500).json({ message: 'Failed to update cart' });
  }
};

/* DELETE /api/cart/remove/:productId */
export const removeFromCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.params.productId
    );
    await cart.save();
    const updated = await populatedCart(req.user.id);
    return res.json(updated);
  } catch (err) {
    console.error('Remove from cart error', err);
    return res.status(500).json({ message: 'Failed to remove from cart' });
  }
};

/* DELETE /api/cart/clear */
export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    return res.json({ message: 'Cart cleared', items: [] });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to clear cart' });
  }
};
