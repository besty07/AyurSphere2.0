## Part B: API Documentation (If Applicable)

### Base URL
The base URL for all API requests is: `http://<server-domain>/api` (e.g., `http://localhost:5000/api`)

### Endpoints List

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/signup` | POST | Register a new user |
| `/auth/login` | POST | User authentication |
| `/auth/me` | GET | Get current authenticated user profile |
| `/plants` | GET | List all plants (supports search & category filters) |
| `/plants/:id` | GET | Get plant details by ID |
| `/plants` | POST | Create a new plant (Admin) |
| `/plants/:id` | PUT | Update an existing plant (Admin) |
| `/plants/:id` | DELETE | Delete a plant (Admin) |
| `/favorites` | GET | List user's favorite plants |
| `/favorites` | POST | Add a plant to user's favorites |
| `/favorites/:plantId` | DELETE | Remove a plant from favorites |
| `/products` | GET | List all products |
| `/products/:id` | GET | Get product details by ID |
| `/products` | POST | Create a new product (Admin) |
| `/products/:id` | PUT | Update an existing product (Admin) |
| `/products/:id` | DELETE | Delete a product (Admin) |
| `/cart` | GET | Get current user's cart |
| `/cart/add` | POST | Add a product to cart |
| `/cart/update` | PATCH | Update cart item quantity |
| `/cart/remove/:productId` | DELETE | Remove item from cart |
| `/cart/clear` | DELETE | Clear the entire cart |
| `/users/profile` | GET | Get user profile |
| `/users` | GET | Get all users (Admin) |
| `/users/profile` | PUT | Update user profile (supports image upload) |
| `/users/send-otp` | POST | Send OTP for verification |
| `/orders/checkout` | POST | Checkout and finalize order |
| `/orders/me` | GET | Get user's order history |
| `/orders/all` | GET | Get all orders (Admin) |
| `/voice` | POST | Handle voice input for voice assistant |

---

### Detailed Endpoint Documentation (Examples)

#### 1. User Authentication
* **Endpoint:** `/auth/login`
* **Method:** `POST`
* **Description:** Authenticates a user and returns a JWT token.
* **Request parameters (Body):**
  * `username` (string, required): The user's username.
  * `password` (string, required): The user's password.
* **Sample request:**
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
* **Sample response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "username": "johndoe",
      "role": "user",
      "createdAt": "2023-10-01T12:00:00Z"
    }
  }
  ```
* **Error messages:**
  * `400 Bad Request`: `{ "message": "Username and password are required" }`
  * `401 Unauthorized`: `{ "message": "Invalid credentials" }`
  * `500 Internal Server Error`: `{ "message": "Failed to login" }`

#### 2. Get All Plants
* **Endpoint:** `/plants`
* **Method:** `GET`
* **Description:** Retrieves a list of plants. Supports optional search and category filters.
* **Request parameters (Query):**
  * `search` (string, optional): Search term for plant name, scientific name, or description.
  * `category` (string, optional): Filter by plant category.
* **Sample request:**
  `GET /api/plants?search=neem&category=medicinal`
* **Sample response (200 OK):**
  ```json
  [
    {
      "_id": "60d0fe4f5311236168a109cb",
      "plantName": "Neem",
      "scientificName": "Azadirachta indica",
      "category": "medicinal",
      "status": "Approved"
    }
  ]
  ```
* **Error messages:**
  * `500 Internal Server Error`: `{ "message": "Failed to load plants" }`

#### 3. Add to Favorites
* **Endpoint:** `/favorites`
* **Method:** `POST`
* **Description:** Adds a specific plant to the authenticated user's favorites list.
* **Request parameters (Body):**
  * `plantId` (string, required): The MongoDB ID of the plant to favorite.
* **Sample request:**
  ```json
  {
    "plantId": "60d0fe4f5311236168a109cb"
  }
  ```
* **Sample response (201 Created):**
  ```json
  {
    "message": "Plant added to favorites"
  }
  ```
* **Error messages:**
  * `400 Bad Request`: `{ "message": "Plant ID is required" }`
  * `404 Not Found`: `{ "message": "Plant not found" }`
  * `409 Conflict`: `{ "message": "Plant already in favorites" }`
  * `500 Internal Server Error`: `{ "message": "Failed to add favorite" }`
