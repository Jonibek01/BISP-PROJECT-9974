document.addEventListener("DOMContentLoaded", () => {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    updateCartCount()
  
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll(".add-to-cart")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        const productName = this.getAttribute("data-name")
        const productPrice = Number.parseFloat(this.getAttribute("data-price"))
        const productImage = this.getAttribute("data-image")
  
        // Check if product already in cart
        const existingProductIndex = cart.findIndex((item) => item.id === productId)
  
        if (existingProductIndex > -1) {
          // Update quantity if product already in cart
          cart[existingProductIndex].quantity += 1
        } else {
          // Add new product to cart
          cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1,
          })
        }
  
        // Save cart to localStorage
        localStorage.setItem("cart", JSON.stringify(cart))
  
        // Update cart count
        updateCartCount()
  
        // Show success message
        showToast("Mahsulot savatga qo'shildi")
      })
    })
  
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
        return
      }
  
      document.getElementById("emptyCartMessage").style.display = "none"
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
  
    function updateCartItemQuantity(productId, change) {
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
  
    function setCartItemQuantity(productId, quantity) {
      const index = cart.findIndex((item) => item.id === productId)
  
      if (index > -1) {
        cart[index].quantity = quantity
        localStorage.setItem("cart", JSON.stringify(cart))
        updateCartCount()
        renderCartItems()
      }
    }
  
    function removeFromCart(productId) {
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
  
    function showToast(message) {
      // Create toast element
      const toastElement = document.createElement("div")
      toastElement.className = "toast-notification"
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
  
  