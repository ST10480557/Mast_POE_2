import React from 'react';
import { Dish } from '../types/dish';

interface MenuItemCardProps {
  dish: Dish;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ dish }) => {
  return (
    <div className="menu-item-card">
      <h3>{dish.name}</h3>
      <p>{dish.description}</p>
      <p>Course: {dish.course}</p>
      <p>Price: ${dish.price.toFixed(2)}</p>
    </div>
  );
};

export default MenuItemCard;