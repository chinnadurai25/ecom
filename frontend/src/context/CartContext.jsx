import API_BASE_URL from '../api';
// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  useEffect(() => {
    if (userEmail) {
      fetch(`${API_BASE_URL}/cart/${userEmail}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCart(data);
          }
        })
        .catch(err => console.error("Failed to fetch cart:", err));
    }
  }, [userEmail]);

  const addToCart = async (product) => {
    const pid = product._id || product.id;

    const newCartItem = {
      ...product,
      productId: pid,
      qty: 1
    };

    setCart(prev => {
      const exists = prev.find(p => p.productId === pid);
      if (exists) {
        return prev.map(p =>
          p.productId === pid ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, newCartItem];
    });

    if (userEmail) {
      try {
        await fetch(`${API_BASE_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            productId: pid,
            name: product.name,
            price: product.price,
            img: product.image || product.img,
            qty: 1
          })
        });
      } catch (err) {
        console.error("Failed to sync add to cart:", err);
      }
    }

    return true; // ✅ IMPORTANT (for toast)
  };

  const removeFromCart = async (id) => {
    setCart(prev => prev.filter(p => p.productId !== id));

    if (userEmail) {
      try {
        await fetch(`${API_BASE_URL}/cart/${userEmail}/${id}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to sync remove from cart:", err);
      }
    }
  };

  const updateQty = async (id, newQty) => {
    if (newQty < 1) {
      removeFromCart(id);
      return;
    }

    setCart(prev =>
      prev.map(p =>
        String(p.productId) === String(id)
          ? { ...p, qty: Number(newQty) }
          : p
      )
    );

    if (userEmail) {
      try {
        await fetch(`${API_BASE_URL}/cart/update-qty`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            productId: id,
            qty: newQty
          })
        });
      } catch (err) {
        console.error("Failed to sync update qty:", err);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (userEmail) {
      try {
        await fetch(`${API_BASE_URL}/cart/${userEmail}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);



