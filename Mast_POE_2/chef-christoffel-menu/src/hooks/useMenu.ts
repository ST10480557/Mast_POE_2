import { useState, useEffect } from 'react';
import { Dish } from '../types/dish';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';

const useMenu = () => {
    const [menuItems, setMenuItems] = useState<Dish[]>([]);

    useEffect(() => {
        const storedMenuItems = getFromLocalStorage<Dish[]>('menuItems');
        if (storedMenuItems) {
            setMenuItems(storedMenuItems);
        }
    }, []);

    const addDish = (dish: Dish) => {
        const updatedMenuItems = [...menuItems, dish];
        setMenuItems(updatedMenuItems);
        saveToLocalStorage('menuItems', updatedMenuItems);
    };

    const updateDish = (updatedDish: Dish) => {
        const updatedMenuItems = menuItems.map(dish =>
            dish.name === updatedDish.name ? updatedDish : dish
        );
        setMenuItems(updatedMenuItems);
        saveToLocalStorage('menuItems', updatedMenuItems);
    };

    const getMenuItems = () => {
        return menuItems;
    };

    return {
        menuItems,
        addDish,
        updateDish,
        getMenuItems,
    };
};

export default useMenu;