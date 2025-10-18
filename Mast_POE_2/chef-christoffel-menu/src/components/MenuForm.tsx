import React, { useState } from 'react';

const MenuForm = ({ onAddDish }) => {
    const [dishName, setDishName] = useState('');
    const [description, setDescription] = useState('');
    const [course, setCourse] = useState('starters');
    const [price, setPrice] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (dishName && description && price) {
            onAddDish({ name: dishName, description, course, price: parseFloat(price) });
            setDishName('');
            setDescription('');
            setCourse('starters');
            setPrice('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Dish Name:
                    <input
                        type="text"
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Course:
                    <select value={course} onChange={(e) => setCourse(e.target.value)}>
                        <option value="starters">Starters</option>
                        <option value="mains">Mains</option>
                        <option value="desserts">Desserts</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Price:
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </label>
            </div>
            <button type="submit">Add Dish</button>
        </form>
    );
};

export default MenuForm;