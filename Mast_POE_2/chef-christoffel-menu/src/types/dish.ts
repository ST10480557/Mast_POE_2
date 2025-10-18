export interface Dish {
    id: string;
    name: string;
    description: string;
    course: 'starter' | 'main' | 'dessert';
    price: number;
}