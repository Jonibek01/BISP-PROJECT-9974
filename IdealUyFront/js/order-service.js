/**
 * Order Service for IdealUy.uz
 * Handles order creation and management
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize checkout page
  const initCheckoutPage = () => {
    const checkoutForm = document.getElementById("checkoutForm")
    if (!checkoutForm) return

    // Load cart items for checkout
    loadCartForCheckout()

    // Handle shipping method selection
    const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]')
    shippingMethods.forEach((method) => {
      method.addEventListener("change", () => {
        updateOrderSummary()
      })
    })

    // Handle payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')
    paymentMethods.forEach((method) => {
      method.addEventListener("change", function () {
        // Show/hide additional fields based on payment method
        const paypalFields = document.getElementById("paypalFields")
        const cardFields = document.getElementById("cardFields")
        const bitcoinFields = document.getElementById("bitcoinFields")

        if (paypalFields) paypalFields.classList.add("d-none")
        if (cardFields) cardFields.classList.add("d-none")
        if (bitcoinFields) bitcoinFields.classList.add("d-none")

        const selectedMethod = this.value
        if (selectedMethod === "paypal" && paypalFields) {
          paypalFields.classList.remove("d-none")
        } else if (selectedMethod === "card" && cardFields) {
          cardFields.classList.remove("d-none")
        } else if (selectedMethod === "bitcoin" && bitcoinFields) {
          bitcoinFields.classList.remove("d-none")
        }
      })
    })

    // Handle checkout form submission
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(checkoutForm)
      const orderData = {
        shippingAddress: {
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          region: formData.get("region"),
          district: formData.get("district"),
          street: formData.get("street"),
          postalCode: formData.get("postalCode"),
        },
        shippingMethod: formData.get("shippingMethod"),
        paymentMethod: formData.get("paymentMethod"),
        notes: formData.get("orderNotes"),
      }

      try {
        // Show loading state
        const submitButton = checkoutForm.querySelector('button[type="submit"]')
        const originalButtonText = submitButton.innerHTML
        submitButton.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
        submitButton.disabled = true

        // Create order
        let orderId = null

        if (typeof ApiService !== "undefined" && ApiService.orders && ApiService.orders.create) {
          try {
            const order = await ApiService.orders.create(orderData)
            orderId = order.id
            console.log("Order created successfully:", order)

            // Clear cart
            if (ApiService.auth && ApiService.auth.isLoggedIn() && ApiService.cart && ApiService.cart.clear) {
              await ApiService.cart.clear()
            } else {
              localStorage.removeItem("cart")
            }
          } catch (apiError) {
            console.error("Error creating order via API:", apiError)
            showToast("Buyurtma yaratishda xatolik yuz berdi: " + apiError.message, "error")

            // Reset button
            if (submitButton) {
              submitButton.innerHTML = originalButtonText
              submitButton.disabled = false
            }
            return
          }
        } else {
          // Fallback for development/testing
          console.warn("ApiService not available, using mock order creation")

          // Generate a random order ID
          orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase()

          // Clear cart
          localStorage.removeItem("cart")
        }

        // Show success message
        showToast("Buyurtma muvaffaqiyatli yaratildi!")

        // Redirect to confirmation page
        window.location.href = `confirmation.html?orderId=${orderId}`
      } catch (error) {
        console.error("Error creating order:", error)

        // Show error message
        showToast("Buyurtma yaratishda xatolik yuz berdi: " + error.message, "error")

        // Reset button
        if (submitButton) {
          submitButton.innerHTML = originalButtonText
          submitButton.disabled = false
        }
      }
    })
  }

  // Load cart items for checkout
  const loadCartForCheckout = async () => {
    const checkoutItemsList = document.getElementById("checkoutItems")
    if (!checkoutItemsList) return

    try {
      let cartItems = []
      let subtotal = 0

      if (
        typeof ApiService !== "undefined" &&
        ApiService.auth &&
        ApiService.auth.isLoggedIn() &&
        ApiService.cart &&
        ApiService.cart.getItems
      ) {
        // User is logged in, get cart from server
        try {
          const cartData = await ApiService.cart.getItems()
          cartItems = cartData.items || []
          subtotal = cartData.subtotal || cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
          console.log("Cart loaded from server for checkout:", cartItems)
        } catch (apiError) {
          console.error("Error loading cart from server for checkout:", apiError)
          // Fall back to local cart
          const localCart = JSON.parse(localStorage.getItem("cart")) || []
          cartItems = localCart
          subtotal = localCart.reduce((total, item) => total + item.price * item.quantity, 0)
        }
      } else {
        // User is not logged in or API not available, get cart from localStorage
        const localCart = JSON.parse(localStorage.getItem("cart")) || []
        cartItems = localCart
        subtotal = localCart.reduce((total, item) => total + item.price * item.quantity, 0)
      }

      // Clear container
      checkoutItemsList.innerHTML = ""

      // Check if cart is empty
      if (cartItems.length === 0) {
        checkoutItemsList.innerHTML = `
          <div class="text-center py-4">
            <p class="text-muted">Savatingiz bo'sh</p>
            <a href="index.html" class="btn btn-primary">Xarid qilishni davom ettirish</a>
          </div>
        `
        return
      }

      // Render each cart item
      cartItems.forEach((item) => {
        const itemElement = document.createElement("div")
        itemElement.className = "checkout-item d-flex align-items-center mb-3"
        itemElement.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="img-fluid me-3" style="width: 60px; height: 60px; object-fit: contain;">
          <div class="flex-grow-1">
            <h6 class="mb-0">${item.name}</h6>
            <div class="d-flex justify-content-between">
              <span>${item.quantity} x ${item.price.toLocaleString()} so'm</span>
              <span>${(item.price * item.quantity).toLocaleString()} so'm</span>
            </div>
          </div>
        `

        checkoutItemsList.appendChild(itemElement)
      })

      // Update order summary
      updateOrderSummary(subtotal)
    } catch (error) {
      console.error("Error loading cart for checkout:", error)
      checkoutItemsList.innerHTML = `
        <div class="alert alert-danger">
          Savat ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.
        </div>
      `
    }
  }

  // Update order summary
  const updateOrderSummary = (subtotal) => {
    const subtotalElement = document.getElementById("checkout-subtotal")
    const shippingElement = document.getElementById("checkout-shipping")
    const taxElement = document.getElementById("checkout-tax")
    const discountElement = document.getElementById("checkout-discount")
    const totalElement = document.getElementById("checkout-total")

    if (!subtotalElement || !totalElement) return

    // Get selected shipping method
    const selectedShippingMethod = document.querySelector('input[name="shippingMethod"]:checked')
    const shippingCost = selectedShippingMethod ? Number.parseInt(selectedShippingMethod.dataset.cost || 0) : 0

    // Calculate values
    const tax = 0 // No tax
    const discount = Math.round(subtotal * 0.05) // 5% discount
    const total = subtotal + shippingCost + tax - discount

    // Update elements
    subtotalElement.textContent = subtotal.toLocaleString() + " so'm"
    if (shippingElement) shippingElement.textContent = shippingCost.toLocaleString() + " so'm"
    if (taxElement) taxElement.textContent = tax.toLocaleString() + " so'm"
    if (discountElement) discountElement.textContent = "-" + discount.toLocaleString() + " so'm"
    totalElement.textContent = total.toLocaleString() + " so'm"
  }

  // Initialize order confirmation page
  const initConfirmationPage = async () => {
    const orderDetailsContainer = document.getElementById("orderDetails")
    if (!orderDetailsContainer) return

    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get("orderId")

    if (!orderId) {
      orderDetailsContainer.innerHTML = `
        <div class="alert alert-warning">
          Buyurtma identifikatori topilmadi.
        </div>
      `
      return
    }

    try {
      // Show loading state
      orderDetailsContainer.innerHTML =
        '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>'

      // Get order details
      let order = null

      if (typeof ApiService !== "undefined" && ApiService.orders && ApiService.orders.getById) {
        try {
          order = await ApiService.orders.getById(orderId)
          console.log("Order details loaded from API:", order)
        } catch (apiError) {
          console.error("Error loading order details from API:", apiError)
          // Fall back to mock order data
          order = createMockOrderDetails(orderId)
        }
      } else {
        // Fallback for development/testing
        console.warn("ApiService not available, using mock order details")
        order = createMockOrderDetails(orderId)
      }

      // Render order details
      orderDetailsContainer.innerHTML = `
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Buyurtma #${order.orderNumber || orderId}</h5>
          </div>
          <div class="card-body">
            <p class="mb-1"><strong>Sana:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            <p class="mb-1"><strong>Holat:</strong> <span class="badge bg-${getStatusColor(order.status)}">${getStatusText(order.status)}</span></p>
            <p class="mb-1"><strong>To'lov usuli:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
            <p class="mb-3"><strong>Yetkazib berish usuli:</strong> ${getShippingMethodText(order.shippingMethod)}</p>
            
            <h6 class="mb-3">Yetkazib berish manzili</h6>
            <p class="mb-1">${order.shippingAddress.fullName}</p>
            <p class="mb-1">${order.shippingAddress.street}, ${order.shippingAddress.district}, ${order.shippingAddress.region}</p>
            <p class="mb-1">${order.shippingAddress.postalCode || ""}</p>
            <p class="mb-3">${order.shippingAddress.phone}</p>
            
            <h6 class="mb-3">Buyurtma elementlari</h6>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Mahsulot</th>
                    <th>Narx</th>
                    <th>Miqdor</th>
                    <th>Jami</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items
                    .map(
                      (item) => `
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <img src="${item.image}" alt="${item.name}" class="img-fluid me-2" style="width: 50px; height: 50px; object-fit: contain;">
                          <span>${item.name}</span>
                        </div>
                      </td>
                      <td>${item.price.toLocaleString()} so'm</td>
                      <td>${item.quantity}</td>
                      <td>${(item.price * item.quantity).toLocaleString()} so'm</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Jami:</strong></td>
                    <td>${order.subtotal.toLocaleString()} so'm</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Yetkazib berish:</strong></td>
                    <td>${order.shippingCost.toLocaleString()} so'm</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Chegirma:</strong></td>
                    <td>-${order.discount.toLocaleString()} so'm</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Umumiy summa:</strong></td>
                    <td><strong>${order.total.toLocaleString()} so'm</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <a href="index.html" class="btn btn-primary">Xarid qilishni davom ettirish</a>
        </div>
      `
    } catch (error) {
      console.error("Error loading order details:", error)
      orderDetailsContainer.innerHTML = `
        <div class="alert alert-danger">
          Buyurtma ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.
        </div>
      `
    }
  }

  // Create mock order details for development/testing
  const createMockOrderDetails = (orderId) => {
    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cart")) || []
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shippingCost = 0 // Free shipping
    const discount = Math.round(subtotal * 0.05) // 5% discount
    const total = subtotal + shippingCost - discount

    return {
      id: orderId,
      orderNumber: "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: "pending",
      paymentMethod: "card",
      shippingMethod: "standard",
      shippingAddress: {
        fullName: "Demo User",
        street: "123 Main St",
        district: "Demo District",
        region: "Demo Region",
        postalCode: "12345",
        phone: "+998 90 123 45 67",
      },
      items: cartItems,
      subtotal: subtotal,
      shippingCost: shippingCost,
      discount: discount,
      total: total,
    }
  }

  // Helper functions for order status and methods
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"
      case "processing":
        return "info"
      case "shipped":
        return "primary"
      case "delivered":
        return "success"
      case "cancelled":
        return "danger"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Kutilmoqda"
      case "processing":
        return "Ishlov berilmoqda"
      case "shipped":
        return "Yuborilgan"
      case "delivered":
        return "Yetkazib berilgan"
      case "cancelled":
        return "Bekor qilingan"
      default:
        return status
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "card":
        return "Kredit karta"
      case "paypal":
        return "PayPal"
      case "bitcoin":
        return "Bitcoin"
      case "cash":
        return "Naqd pul"
      default:
        return method
    }
  }

  const getShippingMethodText = (method) => {
    switch (method) {
      case "standard":
        return "Standart yetkazib berish"
      case "express":
        return "Tezkor yetkazib berish"
      case "pickup":
        return "Do'kondan olish"
      default:
        return method
    }
  }

  // Function to show toast notification
  const showToast = (message, type = "success") => {
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

  // Initialize page based on current URL
  const initPage = () => {
    // Check if on checkout page
    if (window.location.pathname.includes("checkout.html")) {
      initCheckoutPage()
    }

    // Check if on confirmation page
    if (window.location.pathname.includes("confirmation.html")) {
      initConfirmationPage()
    }
  }

  // Initialize page
  initPage()
})

