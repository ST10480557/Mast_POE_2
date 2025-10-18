export const saveMenuItems = (items) => {
    localStorage.setItem('menuItems', JSON.stringify(items));
};

export const getMenuItems = () => {
    const items = localStorage.getItem('menuItems');
    return items ? JSON.parse(items) : [];
};

export const clearMenuItems = () => {
    localStorage.removeItem('menuItems');
};