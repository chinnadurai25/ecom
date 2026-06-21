import API_BASE_URL from '../api';
// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Dynamically read userEmail so it updates when user logs in/out
  const getUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.email || null;
    } catch {
      return null;
    }
  };

  const [userEmail, setUserEmail] = useState(() => getUserEmail());

  // Listen for storage changes (login / logout from any tab or component)
  useEffect(() => {
    const handleStorageChange = () => {
      setUserEmail(getUserEmail());
    };
    window.addEventListener("storage", handleStorageChange);
    // Also poll briefly after mount to catch same-tab login
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Re-fetch cart whenever userEmail changes
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
    } else {
      setCart([]); // Clear cart when logged out
    }
  }, [userEmail]);

  // Call this after login so the cart updates immediately without a page reload
  const refreshCart = () => {
    const email = getUserEmail();
    setUserEmail(email);
  };

  const addToCart = async (product) => {
    const email = getUserEmail();
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

    if (email) {
      try {
        await fetch(`${API_BASE_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: email,
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

    return true;
  };

  const removeFromCart = async (id) => {
    const email = getUserEmail();
    setCart(prev => prev.filter(p => p.productId !== id));

    if (email) {
      try {
        await fetch(`${API_BASE_URL}/cart/${email}/${id}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to sync remove from cart:", err);
      }
    }
  };

  const updateQty = async (id, newQty) => {
    const email = getUserEmail();
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

    if (email) {
      try {
        await fetch(`${API_BASE_URL}/cart/update-qty`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: email,
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
    const email = getUserEmail();
    setCart([]);
    if (email) {
      try {
        await fetch(`${API_BASE_URL}/cart/${email}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
