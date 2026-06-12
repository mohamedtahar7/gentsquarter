"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
} from "react";

export interface CartItem {
  variantId: number; // Maps directly to productVariants.id in your schema
  productId: number; // Maps to products.id
  name: string;
  price: number; // Numeric for seamless client calculations
  image: string; // Primary variant image preview URL
  size: string; // S, M, L, XL, etc.
  color: string; // Black, Beige, White, etc.
  amount: number; // Quantity selected
}

// Data structural blueprint required when pushing an item from product page to cart
interface AddToCartInput {
  variantId: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
}

interface CartContextType {
  cart: CartItem[];
  itemAmount: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (variantId: number) => void;
  clearCart: () => void;
  increaseAmount: (variantId: number) => void;
  decreaseAmount: (variantId: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Safe hydration-friendly client sync
  useEffect(() => {
    const savedCart = localStorage.getItem("gosto_apparel_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error("Failed to parse local storage cart session data", err);
      }
    }
  }, []);

  // 2. Local persistence synchronization loop
  useEffect(() => {
    localStorage.setItem("gosto_apparel_cart", JSON.stringify(cart));
  }, [cart]);

  // 3. Compute dynamic price matrix aggregates
  const { total, itemAmount } = useMemo(() => {
    return cart.reduce(
      (acc, item) => ({
        total: acc.total + item.amount * item.price,
        itemAmount: acc.itemAmount + item.amount,
      }),
      { total: 0, itemAmount: 0 },
    );
  }, [cart]);

  // 4. Cart Action Methods aligned to unique apparel variants
  const addToCart = (newItemInput: AddToCartInput) => {
    const existingItem = cart.find(
      (item) => item.variantId === newItemInput.variantId,
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.variantId === newItemInput.variantId
            ? { ...item, amount: item.amount + 1 }
            : item,
        ),
      );
    } else {
      const newItem: CartItem = { ...newItemInput, amount: 1 };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (variantId: number) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your shopping bag?")) {
      setCart([]);
    }
  };

  const increaseAmount = (variantId: number) => {
    setCart(
      cart.map((item) =>
        item.variantId === variantId
          ? { ...item, amount: item.amount + 1 }
          : item,
      ),
    );
  };

  const decreaseAmount = (variantId: number) => {
    const item = cart.find((i) => i.variantId === variantId);
    if (!item) return;

    if (item.amount > 1) {
      setCart(
        cart.map((i) =>
          i.variantId === variantId ? { ...i, amount: item.amount - 1 } : i,
        ),
      );
    } else {
      removeFromCart(variantId);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemAmount,
        total,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        clearCart,
        increaseAmount,
        decreaseAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error(
      "useCart must be executed within an authorized CartProvider scope",
    );
  return context;
};
