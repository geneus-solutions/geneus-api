import express from "express";
import Cart from "../models/cart.js";
import User from "../models/User.js";
import { configDotenv } from 'dotenv';
configDotenv()
const addtoCart = async (req, res) => {
    try {
      const { userId, courseItem } = req.body;
      
      if (!userId) {
        return res.status(401).send({ message: "User ID is missing" });
      }
  
      if (!courseItem) {
        return res.status(401).send({ message: "Course item is missing" });
      }
  
      const user = await User.findById(userId);
          
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
  
      const courseIndex = user.courses.findIndex(
        (name) => name.toString() === courseItem.course_id.toString()
      );
  
      if (courseIndex !== -1) {
        return res.status(200).json({ message: "Course already purchased" });
      }
  
      const cart = await Cart.findOne({ user_id: userId });
  
      if (cart) {
        const isItemAlreadyInCart = cart.cart_items.some((cart_item) => {
          return (
            cart_item.course_id.toString() === courseItem.course_id.toString()
          );
        });
  
        if (isItemAlreadyInCart) {
          return res.status(200).json({ message: "Course already in cart" });
        }
  
        cart.cart_items.push(courseItem);
  
        let total = 0;
        let discount = 0;
  
        cart.cart_items.forEach((cart_item) => {
          total += cart_item.course_price;
          discount += cart_item.course_discountPrice;
        });
  
        cart.cart_total = total;
        cart.discount = discount;
        cart.total_after_discount = cart.cart_total - cart.discount;
  
        await cart.save();
  
        return res.status(200).json({ message: "Course added to cart" });
      } else {
        const newCart = new Cart({
          user_id: userId,
          cart_items: [courseItem],
          cart_total: courseItem.course_price,
          discount: courseItem.course_discountPrice,
          total_after_discount:
          courseItem.course_price - courseItem.course_discountPrice,
        });
        await newCart.save();
        return res.status(200).json({ message: "Course added to cart" });
      }
    } catch (error) {
      console.error("Error adding course to cart:", error);
      return res.status(500).json({ message: "Error adding course to cart" });
    }
  }

  const getCart = async (req, res) => {
    try {
      const { user_id } = req.query;
      if (!user_id) {
        return res.status(401).send({ message: "User ID is missing" });
      }
      const cart = await Cart.findOne({ user_id }).exec();
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      return res.status(200).json(cart);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ message: "Error fetching cart items" });
    }
  }

const cartEmpty = async (req, res) => {
    try {
      const { cart_id } = req.body;
      if (!cart_id) {
        return res.status(404).send({ message: "Cart ID is missing" });
      }
      const cart = await Cart.findById(cart_id);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      cart.cart_items = [];
      cart.cart_total = 0;
      cart.discount = 0;
      cart.total_after_discount = 0;
      await cart.save();
      return res.status(200).json({ cartItems: cart });
    } catch (error) {
      console.error("Error emptying cart:", error);
      return res.status(500).json({ message: "Error emptying cart" });
    }
  }

  const cartDelete = async (req, res) => {

    try {
      const { user_id, course_id } = req.body;
      if (!user_id || !course_id) {
        return res
          .status(400)
          .json({ message: "Both user_id and course_id are required." });
      }
      const cart = await Cart.findOne({ user_id }).exec();
      if (!cart) {
        return res.status(404).json({ message: "Cart not found." });
      }
      const cartItemIndex = cart.cart_items.findIndex(
        (cart_item) => cart_item._id.toString() === course_id.toString()
      );
      if (cartItemIndex === -1) {
        return res.status(404).json({ message: "Cart item not found." });
      }
      cart.cart_items.splice(cartItemIndex, 1);
      let total = 0;
      let discount = 0;
      cart.cart_items.forEach((cart_item) => {
        total += cart_item.course_price;
        discount += cart_item.course_discountPrice;
      });
      cart.cart_total = total;
      cart.discount = discount;
      cart.total_after_discount = cart.cart_total - cart.discount;
      await cart.save();
      return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json({
        message: "Error deleting cart item",
        error: error.message,
      });
    }
  
   
  }

export {
cartDelete, cartEmpty, getCart, addtoCart
  }
