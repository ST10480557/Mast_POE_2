import React from 'react';
import MenuForm from '../components/MenuForm';
import MenuList from '../components/MenuList';
import { useMenu } from '../hooks/useMenu';

const ChefDashboard: React.FC = () => {
    const { menuItems, addDish } = useMenu();

    return (
        <div>
            <h1>Chef Dashboard</h1>
            <MenuForm onAddDish={addDish} />
            <h2>Total Menu Items: {menuItems.length}</h2>
            <MenuList menuItems={menuItems} />
        </div>
    );
};

export default ChefDashboard;