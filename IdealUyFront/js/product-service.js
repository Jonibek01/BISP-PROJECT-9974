/**
 * Product Service for IdealUy.uz
 * Handles product data fetching and rendering
 */



document.addEventListener("DOMContentLoaded", () => {
  // Initializing loading state
  let isLoading = false

  // Function to show loading state
  const showLoading = (container) => {
    isLoading = true

    // Creating loading spinner
    const loadingSpinner = document.createElement("div")
    loadingSpinner.className = "text-center py-5"
    loadingSpinner.id = "loadingSpinner"
    loadingSpinner.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Mahsulotlar yuklanmoqda...</p>
    `

    // Clearing container and show spinner
    if (container) {
      container.innerHTML = ""
      container.appendChild(loadingSpinner)
    }
  }

  // Function to hide loading state
  const hideLoading = (container) => {
    isLoading = false

    // Removing loading spinner
    const loadingSpinner = document.getElementById("loadingSpinner")
    if (loadingSpinner && container) {
      container.removeChild(loadingSpinner)
    }
  }

  // Function to showing error message
  const showError = (container, message) => {
    const errorMessage = document.createElement("div")
    errorMessage.className = "alert alert-danger"
    errorMessage.textContent = message || "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring."

    if (container) {
      container.appendChild(errorMessage)
    }
  }

  // Function to rendering product card
  const renderProductCard = (product) => {
    // Calculate discount and savings if original price exists
    const hasDiscount = product.original_price && product.original_price > product.price
    const savings = hasDiscount ? product.original_price - product.price : 0

    // Create product card HTML
    const productCard = document.createElement("div")
    productCard.className = "col-md-4 product-item"
    productCard.dataset.category = product.category
    productCard.dataset.brand = product.brand
    productCard.dataset.price = product.price

    productCard.innerHTML = `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" class="img-fluid">
        </div>
        <div class="product-info">
          <h3><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
          <div class="d-flex align-items-center mb-2">
            <div class="rating">
              ${renderRatingStars(product.rating)}
            </div>
          </div>
          ${hasDiscount ? `<div class="original-price text-decoration-line-through text-muted" data-price="${product.original_price}">${product.original_price.toLocaleString()} so'm</div>` : ""}
          <div class="price" data-price="${product.price}">${product.price.toLocaleString()} so'm</div>
          ${hasDiscount ? `<div class="savings text-success">Save ${savings.toLocaleString()} so'm</div>` : ""}
          <button class="btn btn-primary w-100 add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
            <i class="bi bi-cart-plus me-2"></i>Savatga qo'shish
          </button>
        </div>
      </div>
    `

    return productCard
  }

  // Function to render rating stars
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    let starsHtml = ""

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="bi bi-star-fill text-warning"></i>'
    }

    // Add half star if needed
    if (hasHalfStar) {
      starsHtml += '<i class="bi bi-star-half text-warning"></i>'
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="bi bi-star text-warning"></i>'
    }

    return starsHtml
  }


  const loadProducts = async (container) => {
    if (!container) return;

    try {
      showLoading(container);

      // Read category ID from URL
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");

      let products = [];

      if (typeof ApiService !== "undefined" && ApiService.products) {
        try {
          if (category && category !== "all" && ApiService.products.getProductByCategoryId) {
            products = await ApiService.products.getProductByCategoryId(category);
            console.log("Products loaded by category from API:", products);
          } else if (((category && category == "all") || !category)  && ApiService.products.getAll) {
            products = await ApiService.products.getAll();
            console.log("All products loaded from API:", products);
          } else {
            console.warn("No suitable API method found for loading products.");
          }
        } catch (apiError) {
          console.error("Error fetching products from API:", apiError);
          showToast("Error loading products: " + apiError.message, "error");
          products = [];
        }
      } else {
        console.warn("ApiService not available, no products loaded");
        products = [];
      }

      hideLoading(container);

      if (!products || products.length === 0) {
        const noProductsMessage = document.createElement("div")
        noProductsMessage.className = "col-12 text-center py-5"
        noProductsMessage.innerHTML = `
          <i class="bi bi-search display-1 text-muted"></i>
          <h3 class="mt-3">Mahsulotlar topilmadi</h3>
          <p class="text-muted">Iltimos, boshqa parametrlar bilan qidirishni sinab ko'ring.</p>
        `

        container.appendChild(noProductsMessage)
        return
      }

      // Clear container
      container.innerHTML = "";
      // Render each product
      products.forEach((product) => {
        console.log("product", product);
        const productCard = renderProductCard(product);
        container.appendChild(productCard);
      });

      // Initialize cart buttons
      initAddToCartButtons();
    } catch (error) {
      hideLoading(container);
      showError(container, error.message);
      console.error("Error loading products:", error);
    }
  };


  // Function to load categories
  const loadCategories = async (container) => {
    if (!container) return

    try {
      // Fetch categories from API
      let categories = []

      if (typeof ApiService !== "undefined" && ApiService.categories && ApiService.categories.getAll) {
        try {
          categories = await ApiService.categories.getAll()
          console.log("Categories loaded from API:", categories)
        } catch (apiError) {
          console.error("Error fetching categories from API:", apiError)
          // Show error but continue with empty categories array
          showToast("Error loading categories: " + apiError.message, "error")
          categories = []
        }
      } else {
        console.warn("ApiService not available, no categories loaded")
        categories = []
      }

      // Clear container
      container.innerHTML = ""

      // Add "All" category
      const allCategoryItem = document.createElement("li")
      allCategoryItem.className = "list-group-item"
      allCategoryItem.innerHTML = `
        <a href="product-listing.html?category=all" class="category-link" data-category="all">Barcha mahsulotlar</a>
      `
      container.appendChild(allCategoryItem)

      // Render each category
      categories.forEach((category) => {
        const categoryItem = document.createElement("li")
        categoryItem.className = "list-group-item"
        categoryItem.innerHTML = `
          <a href="product-listing.html?category=${category.id}" class="category-link" data-category="${category.id}">${category.name}</a>
        `

        container.appendChild(categoryItem)
      })

      // Initialize category links
      initCategoryLinks()
    } catch (error) {
      showError(container, error.message)
      console.error("Error loading categories:", error)
    }
  }

  const loadCategoriesDropDown = async (container) => {
    if (!container) return

    try {
      // Fetch categories from API
      let categories = []

      if (typeof ApiService !== "undefined" && ApiService.categories && ApiService.categories.getAll) {
        try {
          categories = await ApiService.categories.getAll()
          console.log("Categories loaded from API:", categories)
        } catch (apiError) {
          console.error("Error fetching categories from API:", apiError)
          // Show error but continue with empty categories array
          showToast("Error loading categories: " + apiError.message, "error")
          categories = []
        }
      } else {
        console.warn("ApiService not available, no categories loaded")
        categories = []
      }

      // Clear container
      container.innerHTML = ""

      // Add "All" category
      const allCategoryItem = document.createElement("li")
      allCategoryItem.className = "dropdown-item"
      allCategoryItem.innerHTML = ''
      container.appendChild(allCategoryItem)

      // Render each category
      categories.forEach((category) => {
        const categoryItem = document.createElement("li")
        categoryItem.className = "dropdown-item"
        categoryItem.innerHTML = `
          <a href="product-listing.html?category=${category.id}" class="category-link" data-category="${category.id}">${category.name}</a>
        `

        container.appendChild(categoryItem)
      })

      // Initialize category links
      initCategoryLinks()
    } catch (error) {
      showError(container, error.message)
      console.error("Error loading categories:", error)
    }
  }

  // Function to initialize add to cart buttons
  const initAddToCartButtons = () => {
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
          // Show loading state on button
          const originalButtonText = this.innerHTML // Store original button text
          this.innerHTML =
              '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
          this.disabled = true

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
            } catch (apiError) {
              console.error("Error adding item to server cart:", apiError)
              // Fall back to local cart
              addToLocalCart(productId, productName, productPrice, productImage, quantity)
            }
          } else {
            // User is not logged in or API not available, add to local cart
            addToLocalCart(productId, productName, productPrice, productImage, quantity)
          }

          // Update cart count
          updateCartCount()

          // Reset button
          this.innerHTML = originalButtonText
          this.disabled = false

          // Show success message
          showToast("Mahsulot savatga qo'shildi")
        } catch (error) {
          // Reset button
          this.innerHTML = originalButtonText
          this.disabled = false

          // Show error message
          showToast("Xatolik yuz berdi: " + error.message, "error")
          console.error("Error adding item to cart:", error)
        }
      })
    })
  }

  // Helper function to add item to local cart
  const addToLocalCart = (productId, productName, productPrice, productImage, quantity) => {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || []

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
    console.log(`Added product ${productId} to local cart with quantity ${quantity}`)
  }

  // Function to initialize category links
  const initCategoryLinks = () => {
    const categoryLinks = document.querySelectorAll(".category-link")

    categoryLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()

        const category = this.dataset.category

        // Update URL without reloading page
        const url = new URL(window.location)
        url.searchParams.set("category", category)
        window.history.pushState({}, "", url)

        // Update category title and breadcrumb
        const categoryTitle = document.querySelector(".category-title")
        const categoryName = document.querySelector(".category-name")

        if (categoryTitle) categoryTitle.textContent = this.textContent
        if (categoryName) categoryName.textContent = this.textContent

        // Highlight active category
        categoryLinks.forEach((link) => {
          link.parentElement.classList.remove("active")
        })
        this.parentElement.classList.add("active")

        // Load products for this category
        const productGrid = document.getElementById("productGrid")
        if (productGrid) {
          loadProducts(productGrid, { category })
        }
      })
    })
  }

  // Function to update cart count
  const updateCartCount = async () => {
    const cartCountElements = document.querySelectorAll(".cart-count")

    try {
      let totalItems = 0

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
          totalItems = cartData.items.reduce((total, item) => total + item.quantity, 0)
          console.log("Cart count from server:", totalItems)
        } catch (apiError) {
          console.error("Error getting cart from server:", apiError)
          // Fall back to local cart
          const cart = JSON.parse(localStorage.getItem("cart")) || []
          totalItems = cart.reduce((total, item) => total + item.quantity, 0)
        }
      } else {
        // User is not logged in or API not available, get cart from localStorage
        const cart = JSON.parse(localStorage.getItem("cart")) || []
        totalItems = cart.reduce((total, item) => total + item.quantity, 0)
      }

      // Update cart count elements
      cartCountElements.forEach((element) => {
        element.textContent = totalItems
      })
    } catch (error) {
      console.error("Error updating cart count:", error)
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
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get("category")
    const productId = urlParams.get("id")

    // Product listing page
    const productGrid = document.getElementById("productGrid")
    if (productGrid) {
      // Load products with category filter if provided
      const filters = categoryParam ? { category: categoryParam } : {}
      loadProducts(productGrid, filters)
    }

    const cabinetHeaderGrid = document.getElementById("cabinerHeaderId")
    if (cabinetHeaderGrid) {
      // Load products with category filter if provided
      const filters = categoryParam ? { category: categoryParam } : {}
      loadProducts(productGrid, filters)
    }
    // Category sidebar
    const categoriesList = document.querySelector(".card-body .list-group")
    if (categoriesList) {
      loadCategories(categoriesList)
    }

    const categoriesListDropDown = document.querySelector(".card-body .dropdown-menu")
    if (categoriesList) {
      loadCategoriesDropDown(categoriesListDropDown)
    }

    // Product detail page
    if (productId) {
      loadProductDetail(productId)
    }

    // Update cart count
    updateCartCount()
  }

  // Function to load product detail
  const loadProductDetail = async (productId) => {
    const productDetailContainer = document.querySelector(".product-detail-container")
    if (!productDetailContainer) return

    try {
      showLoading(productDetailContainer)

      // Fetch product from API
      let product = null

      if (typeof ApiService !== "undefined" && ApiService.products && ApiService.products.getById) {
        try {
          product = await ApiService.products.getById(productId)
          console.log("Product detail loaded from API:", product)
        } catch (apiError) {
          console.error("Error fetching product detail from API:", apiError)
          // Show error but continue with null product
          showToast("Error loading product details: " + apiError.message, "error")
          product = null
        }
      } else {
        console.warn("ApiService not available, no product detail loaded")
        product = null
      }

      hideLoading(productDetailContainer)

      if (!product) {
        showError(productDetailContainer, "Mahsulot topilmadi")
        return
      }

      // Render product detail
      productDetailContainer.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <div class="product-images">
              <div class="main-image mb-3">
                <img src="${product.image}" alt="${product.name}" class="img-fluid">
              </div>
              <div class="thumbnails d-flex">
                ${
          product.images
              ? product.images
                  .map(
                      (img) => `
                  <div class="thumbnail me-2 ${img === product.image ? "active" : ""}">
                    <img src="${img}" alt="${product.name}" class="img-fluid">
                  </div>
                `,
                  )
                  .join("")
              : ""
      }
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <h1 class="mb-3">${product.name}</h1>
            <div class="d-flex align-items-center mb-3">
              <div class="rating">
                ${renderRatingStars(product.rating)}
              </div>
              <span class="ms-2 text-muted">(${product.reviewCount || 0} reviews)</span>
            </div>
            <p class="mb-4">${product.description}</p>
            <div class="mb-3">
              ${product.originalPrice ? `<div class="original-price text-decoration-line-through text-muted fs-5">${product.originalPrice.toLocaleString()} so'm</div>` : ""}
              <div class="price fs-3 fw-bold text-primary">${product.price.toLocaleString()} so'm</div>
              ${product.originalPrice ? `<div class="savings text-success">Save ${(product.originalPrice - product.price).toLocaleString()} so'm</div>` : ""}
            </div>
            <div class="mb-4">
              <label class="form-label">Quantity</label>
              <div class="quantity-selector d-flex align-items-center">
                <button class="btn btn-outline-secondary" id="decreaseQuantity">-</button>
                <input type="number" class="form-control text-center mx-2" id="quantity" value="1" min="1" style="width: 60px;">
                <button class="btn btn-outline-secondary" id="increaseQuantity">+</button>
              </div>
            </div>
            <button class="btn btn-primary btn-lg w-100 add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
              <i class="bi bi-cart-plus me-2"></i>Savatga qo'shish
            </button>
            
            ${
          product.inStock
              ? '<p class="text-success mt-2"><i class="bi bi-check-circle"></i> Sotuvda mavjud</p>'
              : '<p class="text-danger mt-2"><i class="bi bi-x-circle"></i> Sotuvda mavjud emas</p>'
      }
            
            <div class="product-features mt-4">
              <h5>Xususiyatlari:</h5>
              <ul class="list-unstyled">
                ${product.features ? product.features.map((feature) => `<li><i class="bi bi-check2 text-primary me-2"></i>${feature}</li>`).join("") : ""}
              </ul>
            </div>
          </div>
        </div>
      `

      // Initialize quantity buttons
      const decreaseBtn = document.getElementById("decreaseQuantity")
      const increaseBtn = document.getElementById("increaseQuantity")
      const quantityInput = document.getElementById("quantity")

      if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener("click", () => {
          const quantity = Number.parseInt(quantityInput.value)
          if (quantity > 1) {
            quantityInput.value = quantity - 1
          }
        })

        increaseBtn.addEventListener("click", () => {
          const quantity = Number.parseInt(quantityInput.value)
          quantityInput.value = quantity + 1
        })
      }

      // Initialize add to cart button
      initAddToCartButtons()

      // Initialize thumbnails
      const thumbnails = document.querySelectorAll(".thumbnail")
      if (thumbnails.length > 0) {
        thumbnails.forEach((thumbnail) => {
          thumbnail.addEventListener("click", function () {
            // Remove active class from all thumbnails
            thumbnails.forEach((t) => t.classList.remove("active"))

            // Add active class to clicked thumbnail
            this.classList.add("active")

            // Update main image
            const mainImage = document.querySelector(".main-image img")
            mainImage.src = this.querySelector("img").src
          })
        })
      }
    } catch (error) {
      hideLoading(productDetailContainer)
      showError(productDetailContainer, error.message)
      console.error("Error loading product detail:", error)
    }
  }

  // Initialize page
  initPage()
})

