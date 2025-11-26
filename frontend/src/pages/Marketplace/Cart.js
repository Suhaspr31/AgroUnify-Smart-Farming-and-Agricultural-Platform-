import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiTrash2, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Simulate checkout and redirect to orders/checkout page
    clearCart();
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="container">
          <FiShoppingCart className="cart-empty-icon"/>
          <h2>Your cart is empty</h2>
          <p>Browse products in the Marketplace and add items to your cart.</p>
          <Link to="/marketplace" className="btn btn-primary">
            Go to Marketplace <FiArrowLeft />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/products/${item.id}`}>
                    <img src={item.image} alt={item.name} className="cart-img"/>
                    {item.name}
                  </Link>
                </td>
                <td>{item.seller}</td>
                <td>₹{item.price}</td>
                <td>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </td>
                <td>₹{(item.price * item.quantity).toLocaleString()}</td>
                <td>
                  <button className="cart-delete" onClick={() => removeFromCart(item.id)}>
                    <FiTrash2/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cart-summary">
          <div>
            <span>Total Items:</span> <span>{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
          </div>
          <div>
            <span>Total Price:</span> <span>₹{total.toLocaleString()}</span>
          </div>
          <div className="cart-actions">
            <button className="btn btn-danger" onClick={clearCart}>
              Clear Cart
            </button>
            <button className="btn btn-primary" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
