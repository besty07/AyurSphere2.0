
# AyurSphere Project Report

**Date:** May 6, 2026

**Author:** GitHub Copilot

## 1. Project Overview

AyurSphere is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to be an e-commerce and informational platform for Ayurvedic plants and products. It provides users with a rich interface to browse, search, and purchase items, while also offering detailed information about the plants. The application includes user authentication, a shopping cart, a favorites system, and an admin dashboard for managing products and plants. A unique feature is the voice assistant, which allows users to interact with the application using voice commands.

## 2. Technical Architecture

The project is divided into two main parts: a `backend` server and a `frontend` client.

### 2.1. Backend (Express.js)

The backend is a Node.js application using the Express.js framework. It handles the business logic, API endpoints, and database interactions.

-   **Database**: MongoDB is used as the database, with Mongoose as the ODM (Object Data Modeling) library to define schemas and interact with the database.
-   **Authentication**: JSON Web Tokens (JWT) are used for securing API endpoints. User registration and login are handled with password hashing (bcryptjs).
-   **API Routes**: The API is structured with a modular routing system. Each major feature (auth, products, plants, cart, favorites, orders) has its own set of routes, controllers, and models.
-   **File Uploads**: `multer` is used to handle image uploads for products and plants.
-   **Environment Management**: `dotenv` is used to manage environment variables for different configurations (development, production).

### 2.2. Frontend (React)

The frontend is a single-page application (SPA) built with React.

-   **UI Framework**: The UI is built with React and styled with Tailwind CSS.
-   **Routing**: `react-router-dom` is used for client-side routing to create a seamless multi-page experience without full page reloads.
-   **State Management**: Component state and props are the primary means of state management. For shared state like user authentication, React's Context API is used.
-   **API Communication**: The frontend communicates with the backend API using the `fetch` API, with a helper module for making requests.
-   **Build Tool**: Vite is used as the build tool for a fast development experience and optimized production builds.

## 3. Core Features

### 3.1. User Authentication

-   **Registration**: New users can create an account by providing a username, email, and password.
-   **Login**: Registered users can log in to access their profile, cart, and other personalized features.
-   **Admin Role**: The system supports an 'admin' role with elevated privileges for managing the application's data.

### 3.2. E-commerce Functionality

-   **Product and Plant Listings**: Users can browse a catalog of Ayurvedic products and plants.
-   **Search**: A search functionality allows users to find specific items.
-   **Shopping Cart**: Users can add items to a shopping cart, view the cart, and proceed to checkout.
-   **Favorites**: Users can mark items as favorites for easy access later.
-   **Order Management**: The application supports an order creation and management flow.

### 3.3. Admin Dashboard

-   **Product Management**: Admins can add, edit, and delete products.
-   **Plant Management**: Admins can add, edit, and delete plant information.
-   **User Management**: (Assumed) Admins likely have the ability to manage users.

### 3.4. Voice Assistant

A standout feature is the voice assistant, which allows for hands-free interaction. It can likely perform actions such as:

-   Searching for products or plants.
-   Navigating to different pages.
-   Adding items to the cart.

## 4. Backend File Structure and Key Components

The backend code is organized in the `backend/src` directory.

-   `app.js`: The main application file where Express is configured, middleware is applied, and routes are mounted.
-   `server.js`: The entry point of the backend application. It connects to the database and starts the Express server.
-   `config/db.js`: Contains the logic for connecting to the MongoDB database.
-   **`controllers/`**: Contains the logic for handling requests. Each controller corresponds to a specific route.
    -   `authController.js`: Handles user registration, login, and token generation.
    -   `productController.js` & `plantController.js`: Manage CRUD operations for products and plants.
    -   `cartController.js`, `favoriteController.js`, `orderController.js`: Manage user-specific data.
    -   `voiceController.js`: Handles the logic for the voice assistant.
-   **`middleware/`**: Contains middleware functions.
    -   `auth.js`: Verifies JWT tokens to protect routes.
    -   `admin.js`: Checks if a user has the admin role.
    -   `upload.js`: Configures `multer` for file uploads.
-   **`models/`**: Defines the Mongoose schemas for the database collections.
    -   `User.js`, `Product.js`, `Plant.js`, `Cart.js`, `Favorite.js`, `Order.js`.
-   **`routes/`**: Defines the API endpoints. Each file maps HTTP methods and URL paths to controller functions.
    -   `authRoutes.js`, `productRoutes.js`, etc.

## 5. Frontend File Structure and Key Components

The frontend code is organized in the `frontend/src` directory.

-   `main.jsx`: The entry point of the React application. It renders the root `App` component.
-   `App.jsx`: The root component that sets up the application's routing.
-   `api/client.js`: A module with helper functions for making API requests to the backend.
-   **`components/`**: Contains reusable UI components.
    -   `PlantCard.jsx`: Displays a single plant or product in a card format.
    -   `CartPanel.jsx`: A side panel that shows the contents of the shopping cart.
    -   `VoiceAssistant.jsx`: The component that implements the voice assistant functionality.
    -   `AddPlantModal.jsx`, `LocationPickerModal.jsx`: Modal dialogs for user interactions.
-   **`context/`**: Contains React Context providers for managing global state (e.g., authentication).
-   **`pages/`**: Contains the main page components that are rendered by the router.
    -   `LandingPage.jsx`: The home page of the application.
    -   `LoginPage.jsx`: The login and registration page.
    -   `DashboardPage.jsx`: The main page for browsing products and plants.
    -   `PlantDetailPage.jsx`: Shows detailed information about a specific plant.
    -   `AdminDashboardPage.jsx`: The dashboard for admin users.
    -   `CheckoutPage.jsx`, `FavoritesPage.jsx`, `UserProfilePage.jsx`: Other user-specific pages.
-   `styles/`: Contains CSS files for styling the application.

## 6. How to Run the Project

To run the project, you need to have Node.js and npm installed.

### 6.1. Backend Setup

1.  Navigate to the `backend` directory.
2.  Create a `.env` file in the `backend` directory with the following variables:
    ```
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ```
3.  Install dependencies: `npm install`
4.  Run the development server: `npm run dev`

The backend server will start on `http://localhost:4000`.

### 6.2. Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`

The frontend development server will start on `http://localhost:5173`. The application will be accessible in your browser at this address.

## 7. Future Work and Recommendations

-   **Enhance State Management**: For a more complex application, consider using a dedicated state management library like Redux or Zustand to better manage global state.
-   **Testing**: Implement a testing strategy with unit tests for controllers and components, and integration tests for API endpoints.
-   **CI/CD**: Set up a Continuous Integration/Continuous Deployment pipeline to automate testing and deployment.
-   **Scalability**: For a production environment, consider containerizing the application with Docker and deploying it to a cloud platform.
-   **Security**: Conduct a security audit to identify and mitigate potential vulnerabilities, such as XSS and CSRF.
-   **Documentation**: Add more detailed inline documentation to the code and generate API documentation.
