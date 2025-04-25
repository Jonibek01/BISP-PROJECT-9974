/**
 * API Service for IdealUy.uz
 * Handles all communication with the backend API
 */

// Updated Base API URL - change this to your actual production API endpoint
// const API_BASE_URL = "https://api.idealuy.uz/api/v1"
const API_BASE_URL = "http://localhost:8081/api/ideal-uy"

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `API error: ${response.status}`)
    } catch (e) {
      throw new Error(`API error: ${response.status}`)
    }
  }

  return response.json()
}

// Get auth token from localStorage
const getAuthToken = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}")
  return userData.token
}

// Default headers for API requests
const getHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
    "accept": "*/*",
  }

  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  return headers
}

// API Service object
const ApiService = {
  /**
   * Product related API calls
   */
  products: {
    // Get all products with optional filtering
    getAll: async (filters = {}) => {
      // const queryParams = new URLSearchParams()

      // // Add filters to query params
      // Object.keys(filters).forEach((key) => {
      //   if (filters[key]) {
      //     queryParams.append(key, filters[key])
      //   }
      // })

      // const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

      try {
        console.log(`Fetching products from: ${API_BASE_URL}/products/all`)
        const response = await fetch(`${API_BASE_URL}/products/all`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching products:", error)
        // Return mock data for development if API is not available
        return getMockProducts(filters)
      }
    },
    
    // Get product list by category
    getProductByCategoryId: async (categoryId) => {
      try {
        console.log(`Fetching product with categoryId: ${categoryId}`)
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error)
        // Return mock data for development if API is not available
        return getMockProductById(productId)
      }
    },

    // Get product list by similar groupd id
    getProductBySimilarPGId: async (similarPGId) => {
      try {
        console.log(`Fetching product list by similar groupd id: ${similarPGId}`)
        const response = await fetch(`${API_BASE_URL}/products/similar/${similarPGId}`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error)
        // Return mock data for development if API is not available
        return getMockProductById(productId)
      }
    },

    // Get a single product by ID
    getById: async (productId) => {
      try {
        console.log(`Fetching product with ID: ${productId}`)
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error)
        // Return mock data for development if API is not available
        return getMockProductById(productId)
      }
    },

    // Get products by category
    getByCategory: async (categoryId) => {
      try {
        console.log(`Fetching products for category: ${categoryId}`)
        const response = await fetch(`${API_BASE_URL}/products?category=${categoryId}`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error)
        // Return mock data for development if API is not available
        return getMockProducts({ category: categoryId })
      }
    },

    // Search products
    search: async (query) => {
      try {
        console.log(`Searching products with query: ${query}`)
        const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error searching products with query ${query}:`, error)
        // Return mock data for development if API is not available
        return getMockProducts({ search: query })
      }
    },
  },

  /**
   * Category related API calls
   */
  categories: {
    // Get all categories
    getAll: async () => {
      try {
        console.log("Fetching categories")
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "GET",
          headers: getHeaders(false),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Return mock data for development if API is not available
        return getMockCategories()
      }
    },
  },

  /**
   * User authentication related API calls
   */
  auth: {
    // Login user
    login: async (username, password) => {
      try {
        console.log(`Logging in user: ${username}`)
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: getHeaders(false),
          body: JSON.stringify({ username, password }),
        })
        console.log("LOGIN RESPONSE - "+response)
        const data = await handleResponse(response)

        // Save user data to localStorage
        if (data.token) {
          const userData = {
            token: data.token,
            userId: data.userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            isLoggedIn: true,
          }

          localStorage.setItem("userData", JSON.stringify(userData))
        }

        return data
      } catch (error) {
        console.error("Error during login:", error)
        throw error
      }
    },

    // Register new user
    register: async (userData) => {
      try {
        console.log("Registering new user")
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: getHeaders(false),
          body: JSON.stringify(userData),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error during registration:", error)
        throw error
      }
    },

    // Verify phone number
    verifyPhone: async (phone, code) => {
      try {
        console.log(`Verifying phone: ${phone} with code: ${code}`)
        const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
          method: "POST",
          headers: getHeaders(false),
          body: JSON.stringify({ phone, code }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error during phone verification:", error)
        throw error
      }
    },

    // Request password reset
    requestPasswordReset: async (email) => {
      try {
        console.log(`Requesting password reset for: ${email}`)
        const response = await fetch(`${API_BASE_URL}/auth/request-reset`, {
          method: "POST",
          headers: getHeaders(false),
          body: JSON.stringify({ email }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error requesting password reset:", error)
        throw error
      }
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
      try {
        console.log("Resetting password")
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: "POST",
          headers: getHeaders(false),
          body: JSON.stringify({ token, newPassword }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error resetting password:", error)
        throw error
      }
    },

    // Logout user
    logout: () => {
      console.log("Logging out user")
      // Clear user data from localStorage
      localStorage.removeItem("userData")
      // Optionally call logout endpoint if needed
    },

    // Check if user is logged in
    isLoggedIn: () => {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      return !!userData.token
    },
  },

  /**
   * User profile related API calls
   */
  user: {
    // Get user profile
    getProfile: async () => {
      try {
        console.log("Fetching user profile")
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: "GET",
          headers: getHeaders(true),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        throw error
      }
    },

    // Update user profile
    updateProfile: async (profileData) => {
      try {
        console.log("Updating user profile")
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(profileData),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error updating user profile:", error)
        throw error
      }
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
      try {
        console.log("Changing password")
        const response = await fetch(`${API_BASE_URL}/user/change-password`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ currentPassword, newPassword }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error changing password:", error)
        throw error
      }
    },

    // Get user addresses
    getAddresses: async () => {
      try {
        console.log("Fetching user addresses")
        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
          method: "GET",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching user addresses:", error)
        throw error
      }
    },

    // Add new address
    addAddress: async (addressData) => {
      try {
        console.log("Adding new address")
        const response = await fetch(`${API_BASE_URL}/user/addresses`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(addressData),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error adding address:", error)
        throw error
      }
    },

    // Update address
    updateAddress: async (addressId, addressData) => {
      try {
        console.log(`Updating address: ${addressId}`)
        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(addressData),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error updating address ${addressId}:`, error)
        throw error
      }
    },

    // Delete address
    deleteAddress: async (addressId) => {
      try {
        console.log(`Deleting address: ${addressId}`)
        const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
          method: "DELETE",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error deleting address ${addressId}:`, error)
        throw error
      }
    },

    // Get user orders
    getOrders: async () => {
      try {
        console.log("Fetching user orders")
        const response = await fetch(`${API_BASE_URL}/user/orders`, {
          method: "GET",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching user orders:", error)
        throw error
      }
    },
  },

  /**
   * Cart related API calls
   */
  cart: {
    // Get cart items
    getItems: async () => {
      try {
        console.log("Fetching cart items")
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: "GET",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching cart items:", error)
        throw error
      }
    },

    // Add item to cart
    addItem: async (productId, quantity = 1) => {
      try {
        console.log(`Adding product ${productId} to cart with quantity ${quantity}`)
        const response = await fetch(`${API_BASE_URL}/cart/items`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ productId, quantity }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error adding item to cart:", error)
        throw error
      }
    },

    // Update cart item quantity
    updateItemQuantity: async (cartItemId, quantity) => {
      try {
        console.log(`Updating cart item ${cartItemId} quantity to ${quantity}`)
        const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ quantity }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error updating cart item quantity:", error)
        throw error
      }
    },

    // Remove item from cart
    removeItem: async (cartItemId) => {
      try {
        console.log(`Removing item ${cartItemId} from cart`)
        const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
          method: "DELETE",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error removing item from cart:", error)
        throw error
      }
    },

    // Clear cart
    clear: async () => {
      try {
        console.log("Clearing cart")
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
          method: "POST",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error clearing cart:", error)
        throw error
      }
    },
  },

  /**
   * Order related API calls
   */
  orders: {
    // Get user orders
    getAll: async () => {
      try {
        console.log("Fetching all orders")
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: "GET",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching orders:", error)
        throw error
      }
    },

    // Get order details
    getById: async (orderId) => {
      try {
        console.log(`Fetching order: ${orderId}`)
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          method: "GET",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error)
        throw error
      }
    },

    // Create new order
    create: async (orderData) => {
      try {
        console.log("Creating new order")
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(orderData),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error creating order:", error)
        throw error
      }
    },

    // Cancel order
    cancel: async (orderId) => {
      try {
        console.log(`Cancelling order: ${orderId}`)
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
          method: "POST",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error(`Error cancelling order ${orderId}:`, error)
        throw error
      }
    },
  },

  /**
   * Wishlist related API calls
   */
  wishlist: {
    // Get wishlist items
    getItems: async () => {
      try {
        console.log("Fetching wishlist items")
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          method: "GET",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error fetching wishlist items:", error)
        throw error
      }
    },

    // Add item to wishlist
    addItem: async (productId) => {
      try {
        console.log(`Adding product ${productId} to wishlist`)
        const response = await fetch(`${API_BASE_URL}/wishlist/items`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ productId }),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error adding item to wishlist:", error)
        throw error
      }
    },

    // Remove item from wishlist
    removeItem: async (wishlistItemId) => {
      try {
        console.log(`Removing item ${wishlistItemId} from wishlist`)
        const response = await fetch(`${API_BASE_URL}/wishlist/items/${wishlistItemId}`, {
          method: "DELETE",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error removing item from wishlist:", error)
        throw error
      }
    },

    // Clear wishlist
    clear: async () => {
      try {
        console.log("Clearing wishlist")
        const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
          method: "POST",
          headers: getHeaders(),
        })

        return handleResponse(response)
      } catch (error) {
        console.error("Error clearing wishlist:", error)
        throw error
      }
    },
  },
}

// Mock data functions for development
function getMockProducts(filters = {}) {
  console.log("Using mock product data with filters:", filters)

  const allProducts = [
    {
      id: "1",
      name: "Elektron choynak",
      price: 120000,
      originalPrice: 150000,
      description:
        "Zamonaviy elektron choynak suv qaynatish uchun eng qulay va tez usul. Energiya tejamkor va ishlatish oson.",
      image: "images/products/Elektron choynak.png",
      category: "kitchen",
      brand: "Ideal",
      rating: 4.5,
      reviewCount: 12,
      inStock: true,
      features: ["Material: Zanglamaydigan po'lat", "Hajmi: 1.7 litr", "Quvvat: 1500W"],
    },
    {
      id: "2",
      name: "Coffee Apparati",
      price: 300000,
      originalPrice: 350000,
      description:
        "Yuqori sifatli kofe tayyorlash uchun mo'ljallangan apparat. Turli xil kofe turlarini tayyorlash imkoniyati.",
      image: "images/products/Coffee Apparati.png",
      category: "kitchen",
      brand: "Ideal",
      rating: 4.2,
      reviewCount: 8,
      inStock: true,
      features: ["Material: Plastik va metall", "Hajmi: 1.5 litr", "Quvvat: 1000W"],
    },
    {
      id: "3",
      name: "Go'sht Maydalagich",
      price: 300000,
      originalPrice: null,
      description: "Kuchli va ishonchli go'sht maydalagich. Turli xil go'sht turlarini maydalash uchun mo'ljallangan.",
      image: "images/products/Go'sht Maydalagich.png",
      category: "kitchen",
      brand: "Ideal",
      rating: 4.0,
      reviewCount: 15,
      inStock: true,
      features: ["Material: Plastik va metall", "Quvvat: 1800W", "Tezlik: 3 xil tezlik"],
    },
    {
      id: "4",
      name: "Oshxona to'plam",
      price: 200000,
      originalPrice: 250000,
      description: "Oshxona uchun to'liq to'plam. Barcha kerakli idishlar va anjomlar mavjud.",
      image: "images/products/Oshxona to'plam.png",
      category: "kitchen",
      brand: "Ideal",
      rating: 4.7,
      reviewCount: 20,
      inStock: true,
      features: ["Material: Zanglamaydigan po'lat", "To'plam tarkibi: 24 ta idish", "Qozon: 3 ta"],
    },
    {
      id: "5",
      name: "Mixer Blender",
      price: 200000,
      originalPrice: null,
      description: "Ko'p funksiyali mixer va blender. Turli xil taomlar tayyorlash uchun ideal.",
      image: "images/products/Mixer Blender.png",
      category: "kitchen",
      brand: "Ideal",
      rating: 4.3,
      reviewCount: 10,
      inStock: true,
      features: ["Material: Plastik va metall", "Quvvat: 800W", "Tezlik: 5 xil tezlik"],
    },
  ]

  // Apply filters
  let filteredProducts = [...allProducts]

  if (filters.category && filters.category !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.category === filters.category)
  }

  if (filters.brand) {
    filteredProducts = filteredProducts.filter((product) => product.brand === filters.brand)
  }

  if (filters.minPrice) {
    filteredProducts = filteredProducts.filter((product) => product.price >= filters.minPrice)
  }

  if (filters.maxPrice) {
    filteredProducts = filteredProducts.filter((product) => product.price <= filters.maxPrice)
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm),
    )
  }

  return filteredProducts
}

function getMockProductById(productId) {
  console.log(`Using mock data for product ID: ${productId}`)
  const products = getMockProducts()
  return products.find((product) => product.id === productId) || null
}

function getMockCategories() {
  console.log("Using mock category data")
  return [
    { id: "kitchen", name: "Oshxona jihozlari", count: 15 },
    { id: "laundry", name: "Kir yuvish jihozlari", count: 8 },
    { id: "cleaning", name: "Tozalash jihozlari", count: 10 },
    { id: "climate", name: "Iqlim jihozlari", count: 5 },
  ]
}

// Export the API service
window.ApiService = ApiService

