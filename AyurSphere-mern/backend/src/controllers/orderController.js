import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';

export const checkoutCart = async (req, res) => {
  try {
    const { 
      name, email, mobile, shippingAddress, paymentMode, 
      subTotal, gstAmount, shippingAmount, totalAmount 
    } = req.body;

    // Fetch user's active cart to map items
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const orderItems = cart.items.map(item => {
      const p = item.product;
      return {
        product: p._id,
        name: p.name,
        price: p.price,
        image: p.image || p.plantId?.imagePath,
        quantity: item.quantity
      };
    });

    const newOrder = await Order.create({
      user: req.user.id,
      items: orderItems,
      name, email, mobile, shippingAddress, paymentMode,
      subTotal, gstAmount, shippingAmount, totalAmount
    });

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });

    res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving orders', error: error.message });
  }
};
