document.addEventListener("DOMContentLoaded", () => {
  // Initializing ApiService
  const ApiService = window.ApiService || {
    auth: {
      isLoggedIn: () => false,
    },
    cart: {
      getItems: async () => {
        return { items: [] }
      },
      addItem: async (productId, quantity) => {
        console.log(`Simulating adding item ${productId} with quantity ${quantity} to server cart`)
      },
      updateItemQuantity: async (itemId, quantity) => {
        console.log(`Simulating updating item ${itemId} to quantity ${quantity} on server`)
      },
      removeItem: async (itemId) => {
        console.log(`Simulating removing item ${itemId} from server`)
      },
    },
  }

  // Initializing cart from localStorage or API
  let cart = []
  loadCart()

  // Function to load cart data
  async function loadCart() {
    try {
      if (
          typeof ApiService !== "undefined" &&
          ApiService.auth &&
          ApiService.auth.isLoggedIn() &&
          ApiService.cart &&
          ApiService.cart.getItems
      ) {
        // User is logged in, trying to get cart from server
        try {
          const cartData = await ApiService.cart.getItems()
          cart = cartData.items || []
          console.log("Cart loaded from server:", cart)
        } catch (apiError) {
          console.error("Error loading cart from server:", apiError)
          // Fall back to local cart
          cart = JSON.parse(localStorage.getItem("cart")) || []
        }
      } else {
        // User is not logged in or API not available, get cart from localStorage
        cart = JSON.parse(localStorage.getItem("cart")) || []
      }

      // Updating cart count
      updateCartCount()

      // Rendering cart items if on cart page
      const cartItemsList = document.getElementById("cartItemsList")
      if (cartItemsList) {
        renderCartItems()
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      cart = JSON.parse(localStorage.getItem("cart")) || []
    }
  }

  // Add to cart functionality
  const addToCartButtons = document.querySelectorAll(".add-to-cart")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const productId = this.getAttribute("data-id")
      const productName = this.getAttribute("data-name")
      const productPrice = Number.parseFloat(this.getAttribute("data-price"))
      const productImage = this.getAttribute("data-image")

      // Get quantity if available (for product detail page)
      let quantity = 1
      const quantityInput = document.getElementById("quantity")
      if (quantityInput) {
        quantity = Number.parseInt(quantityInput.value)
      }

      try {
        if (
            typeof ApiService !== "undefined" &&
            ApiService.auth &&
            ApiService.auth.isLoggedIn() &&
            ApiService.cart &&
            ApiService.cart.addItem
        ) {
          // User is logged in, add to server cart
          try {
            await ApiService.cart.addItem(productId, quantity)
            console.log(`Added product ${productId} to server cart with quantity ${quantity}`)
            // Reload cart data
            loadCart()
          } catch (apiError) {
            console.error("Error adding item to server cart:", apiError)
            // Fall back to local cart
            addToLocalCart(productId, productName, productPrice, productImage, quantity)
          }
        } else {
          // User is not logged in or API not available, add to local cart
          addToLocalCart(productId, productName, productPrice, productImage, quantity)
        }

        // Show success message
        showToast("Mahsulot savatga qo'shildi")
      } catch (error) {
        console.error("Error adding item to cart:", error)
        showToast("Xatolik yuz berdi: " + error.message, "error")
      }
    })
  })

  // Helper function to add item to local cart
  function addToLocalCart(productId, productName, productPrice, productImage, quantity) {
    // Check if product already in cart
    const existingProductIndex = cart.findIndex((item) => item.id === productId)

    if (existingProductIndex > -1) {
      // Update quantity if product already in cart
      cart[existingProductIndex].quantity += quantity
    } else {
      // Add new product to cart
      cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: quantity,
      })
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count
    updateCartCount()

    console.log(`Added product ${productId} to local cart with quantity ${quantity}`)
  }

  // Cart page functionality
  const cartItemsList = document.getElementById("cartItemsList")
  if (cartItemsList) {
    renderCartItems()
  }

  // Helper functions
  function updateCartCount() {
    const cartCountElements = document.querySelectorAll(".cart-count")
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

    cartCountElements.forEach((element) => {
      element.textContent = totalItems
    })
  }

  function renderCartItems() {
    if (!cartItemsList) return

    if (cart.length === 0) {
      document.getElementById("emptyCartMessage").style.display = "block"
      document.getElementById("cartSummary").style.display = "none"
      return
    }

    document.getElementById("emptyCartMessage").style.display = "none"
    document.getElementById("cartSummary").style.display = "block"
    cartItemsList.innerHTML = ""

    let subtotal = 0

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal

      const cartItemElement = document.createElement("div")
      cartItemElement.className = "cart-item d-flex align-items-center mb-4 pb-3 border-bottom"
      cartItemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="img-fluid me-3 cart-item-image">
        <div class="flex-grow-1">
          <h5 class="mb-1">${item.name}</h5>
          <div class="d-flex justify-content-between align-items-center">
            <div class="quantity-selector d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
              <input type="number" class="form-control form-control-sm text-center mx-2" value="${item.quantity}" min="1" style="width: 50px;" data-id="${item.id}">
              <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
            </div>
            <div>
              <span class="price">${item.price.toLocaleString()} so'm</span>
            </div>
            <div>
              <span class="fw-bold">${(item.price * item.quantity).toLocaleString()} so'm</span>
            </div>
            <button class="btn btn-sm btn-outline-danger remove-from-cart" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `

      cartItemsList.appendChild(cartItemElement)
    })

    // Update order summary
    updateOrderSummary(subtotal)

    // Add event listeners
    addCartEventListeners()
  }

  function addCartEventListeners() {
    // Decrease quantity buttons
    const decreaseButtons = document.querySelectorAll(".decrease-quantity")
    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        updateCartItemQuantity(productId, -1)
      })
    })

    // Increase quantity buttons
    const increaseButtons = document.querySelectorAll(".increase-quantity")
    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        updateCartItemQuantity(productId, 1)
      })
    })

    // Quantity inputs
    const quantityInputs = document.querySelectorAll(".quantity-selector input")
    quantityInputs.forEach((input) => {
      input.addEventListener("change", function () {
        const productId = this.getAttribute("data-id")
        const newQuantity = Number.parseInt(this.value)

        if (newQuantity > 0) {
          setCartItemQuantity(productId, newQuantity)
        } else {
          this.value = 1
          setCartItemQuantity(productId, 1)
        }
      })
    })

    // Remove buttons
    const removeButtons = document.querySelectorAll(".remove-from-cart")
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        removeFromCart(productId)
      })
    })

    // Gift box checkbox
    const giftBoxCheckbox = document.getElementById("giftBox")
    if (giftBoxCheckbox) {
      giftBoxCheckbox.addEventListener("change", () => {
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
        updateOrderSummary(subtotal)
      })
    }
  }

  async function updateCartItemQuantity(productId, change) {
    try {
      if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.isLoggedIn() && ApiService.cart) {
        // User is logged in, update server cart
        try {
          // Find the cart item to get its ID
          const cartItem = cart.find((item) => item.id === productId)
          if (cartItem) {
            const newQuantity = cartItem.quantity + change
            if (newQuantity < 1) return // Don't allow quantity less than 1

            await ApiService.cart.updateItemQuantity(cartItem.id, newQuantity)
            console.log(`Updated cart item ${productId} quantity to ${newQuantity} on server`)
            // Reload cart data
            loadCart()
          }
        } catch (apiError) {
          console.error("Error updating cart item on server:", apiError)
          // Fall back to local cart update
          updateLocalCartItemQuantity(productId, change)
        }
      } else {
        // User is not logged in or API not available, update local cart
        updateLocalCartItemQuantity(productId, change)
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error)
      showToast("Xatolik yuz berdi: " + error.message, "error")
    }
  }

  function updateLocalCartItemQuantity(productId, change) {
    const index = cart.findIndex((item) => item.id === productId)

    if (index > -1) {
      cart[index].quantity += change

      if (cart[index].quantity < 1) {
        cart[index].quantity = 1
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      updateCartCount()
      renderCartItems()
    }
  }

  async function setCartItemQuantity(productId, quantity) {
    try {
      if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.isLoggedIn() && ApiService.cart) {
        // User is logged in, update server cart
        try {
          // Find the cart item to get its ID
          const cartItem = cart.find((item) => item.id === productId)
          if (cartItem) {
            await ApiService.cart.updateItemQuantity(cartItem.id, quantity)
            console.log(`Set cart item ${productId} quantity to ${quantity} on server`)
            // Reload cart data
            loadCart()
          }
        } catch (apiError) {
          console.error("Error setting cart item quantity on server:", apiError)
          // Fall back to local cart update
          setLocalCartItemQuantity(productId, quantity)
        }
      } else {
        // User is not logged in or API not available, update local cart
        setLocalCartItemQuantity(productId, quantity)
      }
    } catch (error) {
      console.error("Error setting cart item quantity:", error)
      showToast("Xatolik yuz berdi: " + error.message, "error")
    }
  }

  function setLocalCartItemQuantity(productId, quantity) {
    const index = cart.findIndex((item) => item.id === productId)

    if (index > -1) {
      cart[index].quantity = quantity
      localStorage.setItem("cart", JSON.stringify(cart))
      updateCartCount()
      renderCartItems()
    }
  }

  async function removeFromCart(productId) {
    try {
      if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.isLoggedIn() && ApiService.cart) {
        // User is logged in, remove from server cart
        try {
          // Find the cart item to get its ID
          const cartItem = cart.find((item) => item.id === productId)
          if (cartItem) {
            await ApiService.cart.removeItem(cartItem.id)
            console.log(`Removed cart item ${productId} from server`)
            // Reload cart data
            loadCart()
          }
        } catch (apiError) {
          console.error("Error removing cart item from server:", apiError)
          // Fall back to local cart update
          removeFromLocalCart(productId)
        }
      } else {
        // User is not logged in or API not available, update local cart
        removeFromLocalCart(productId)
      }
    } catch (error) {
      console.error("Error removing cart item:", error)
      showToast("Xatolik yuz berdi: " + error.message, "error")
    }
  }

  function removeFromLocalCart(productId) {
    cart = cart.filter((item) => item.id !== productId)
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    renderCartItems()
  }

  function updateOrderSummary(subtotal) {
    const subtotalElement = document.getElementById("subtotal")
    const shippingElement = document.getElementById("shipping")
    const taxElement = document.getElementById("tax")
    const discountElement = document.getElementById("discount")
    const totalElement = document.getElementById("totalPrice")

    if (!subtotalElement || !totalElement) return

    // Calculate values
    const shipping = 0 // Free shipping
    const tax = 0 // No tax
    const discount = Math.round(subtotal * 0.05) // 5% discount

    // Add gift box price if checked
    const giftBoxCheckbox = document.getElementById("giftBox")
    const giftBoxPrice = giftBoxCheckbox && giftBoxCheckbox.checked ? 10000 : 0

    const total = subtotal + shipping + tax - discount + giftBoxPrice

    // Update elements
    subtotalElement.textContent = subtotal.toLocaleString() + " so'm"
    if (shippingElement) shippingElement.textContent = shipping.toLocaleString() + " so'm"
    if (taxElement) taxElement.textContent = tax.toLocaleString() + " so'm"
    if (discountElement) discountElement.textContent = "-" + discount.toLocaleString() + " so'm"
    totalElement.textContent = total.toLocaleString() + " so'm"
  }

  function showToast(message, type = "success") {
    // Create toast element
    const toastElement = document.createElement("div")
    toastElement.className = `toast-notification ${type}`
    toastElement.textContent = message

    // Add to document
    document.body.appendChild(toastElement)

    // Show toast
    setTimeout(() => {
      toastElement.classList.add("show")
    }, 100)

    // Hide and remove toast
    setTimeout(() => {
      toastElement.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(toastElement)
      }, 300)
    }, 3000)
  }
})

