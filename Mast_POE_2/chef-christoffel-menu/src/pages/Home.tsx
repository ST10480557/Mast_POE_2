import React from 'react';
import { useMenu } from '../hooks/useMenu';
import MenuList from '../components/MenuList';

const Home: React.FC = () => {
    const { menuItems } = useMenu();

    return (
        <div>
            <h1>Chef Christoffel's Menu</h1>
            <p>Total Menu Items: {menuItems.length}</p>
            <MenuList items={menuItems} />
        </div>
    );
};

export default Home;