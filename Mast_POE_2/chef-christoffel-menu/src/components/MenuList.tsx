import React from 'react';
import { Dish } from '../types/dish';
import MenuItemCard from './MenuItemCard';

interface MenuListProps {
  dishes: Dish[];
}

const MenuList: React.FC<MenuListProps> = ({ dishes }) => {
  return (
    <div>
      <h2>Menu Items</h2>
      <p>Total Dishes: {dishes.length}</p>
      <div className="menu-list">
        {dishes.map((dish) => (
          <MenuItemCard key={dish.name} dish={dish} />
        ))}
      </div>
    </div>
  );
};

export default MenuList;