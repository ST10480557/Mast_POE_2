# Chef Christoffel Menu Management Application

This application allows Chef Christoffel to manage and update his menu, providing clients with access to the latest culinary offerings. The app features a user-friendly interface for entering dish names, descriptions, selecting courses, and setting prices. 

## Features

- **Dish Management**: Chef Christoffel can add, update, and remove dishes from the menu.
- **Course Selection**: Dishes can be categorized as starters, mains, or desserts.
- **Menu Display**: Clients can view the latest menu items along with descriptions and prices.
- **Total Menu Items**: The home screen displays the total number of menu items available for selection.

## Project Structure

```
chef-christoffel-menu
├── src
│   ├── App.tsx
│   ├── index.tsx
│   ├── pages
│   │   └── Home.tsx
│   ├── components
│   │   ├── ChefDashboard.tsx
│   │   ├── MenuForm.tsx
│   │   ├── MenuList.tsx
│   │   ├── MenuItemCard.tsx
│   │   └── CourseFilter.tsx
│   ├── hooks
│   │   └── useMenu.ts
│   ├── types
│   │   └── dish.ts
│   ├── styles
│   │   └── globals.css
│   └── utils
│       └── storage.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd chef-christoffel-menu
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```
This will launch the app in your default web browser.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.