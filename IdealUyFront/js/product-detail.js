document.addEventListener("DOMContentLoaded", () => {
  // Geting product ID from URL and log it for debugging
  const urlParams = new URLSearchParams(window.location.search)
  const productId = urlParams.get("id")
  console.log("Product ID from URL:", productId)

  // If no product ID is provided, using a default
  if (!productId) {
    console.log("No product ID found, using default (1)")
    loadProductDetails("1") // Default to first product
  } else {
    console.log(`Loading product with ID: ${productId}`)
    loadProductDetails(productId)
  }



  // Function to loading product details
  async function loadProductDetails(id) {
    console.log(`Inside loadProductDetails with ID: ${id}`)
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

    if (!product) {
      console.error(`Product with ID ${id} not found!`)
      // Fallback to first product if ID not found
      console.log("Falling back to product ID 1")
      loadProductDetails("1")
      return
    }

    console.log("Found product:", product.name)

    // Updating page title
    document.title = `${product.name} - IdealUy.uz`

    // Updating breadcrumb
    const breadcrumbProductName = document.querySelector(".breadcrumb-item.active")
    if (breadcrumbProductName) {
      breadcrumbProductName.textContent = product.name
    }

    // Updating product name
    const productNameElements = document.querySelectorAll("h1.mb-3")
    productNameElements.forEach((element) => {
      element.textContent = product.name
    })

    // Updaing price
    const priceElements = document.querySelectorAll("h2.price")
    priceElements.forEach((element) => {
      element.textContent = `${product.price} so'm`
    })

    // Updating description
    const descriptionElements = document.querySelectorAll(".product-info > p.mb-4")
    descriptionElements.forEach((element) => {
      element.textContent = product.description
    })

    // Updating main image
    const mainImage = document.querySelector(".main-image img")
    if (mainImage) {
      mainImage.src = product.main_image
      mainImage.alt = product.name
    }

    // Updating thumbnails
    const thumbnailsContainer = document.querySelector(".thumbnails")
    if (thumbnailsContainer && product.thumbnails && product.thumbnails.length > 0) {

      thumbnailsContainer.innerHTML = ""

      product.thumbnails.forEach((thumbnail, index) => {
        const thumbnailDiv = document.createElement("div")
        thumbnailDiv.className = `thumbnail me-2 ${index === 0 ? "active" : ""}`
        thumbnailDiv.innerHTML = `<img src="${thumbnail}" alt="${product.name} - Thumbnail ${index + 1}" class="img-fluid rounded">`

        // Add click event to switch main image
        thumbnailDiv.addEventListener("click", function () {
          // Update main image
          mainImage.src = thumbnail

          // Update active thumbnail
          document.querySelectorAll(".thumbnail").forEach((thumb) => {
            thumb.classList.remove("active")
          })
          this.classList.add("active")
        })

        thumbnailsContainer.appendChild(thumbnailDiv)
      })
    }

    // Update details tab
    const detailsTab = document.querySelector("#details")
    if (detailsTab && product.details && product.details.length > 0) {
      const detailsList = document.createElement("ul")

      product.details.forEach((detail) => {
        const listItem = document.createElement("li")
        listItem.textContent = detail
        detailsList.appendChild(listItem)
      })

      detailsTab.innerHTML = ""
      detailsTab.appendChild(detailsList)
    }

    // Update dimensions tab
    const dimensionsTab = document.querySelector("#dimensions")
    if (dimensionsTab && product.dimensions && product.dimensions.length > 0) {
      const dimensionsList = document.createElement("ul")

      product.dimensions.forEach((dimension) => {
        const listItem = document.createElement("li")
        listItem.textContent = dimension
        dimensionsList.appendChild(listItem)
      })

      dimensionsTab.innerHTML = ""
      dimensionsTab.appendChild(dimensionsList)
    }

    const productGrid = document.getElementById("related-products")
    loadSimilarProducts(productGrid, {id})

    // Update add to cart button
    const addToCartButton = document.querySelector(".add-to-cart")
    if (addToCartButton) {
      addToCartButton.setAttribute("data-id", id)
      addToCartButton.setAttribute("data-name", product.name)
      // addToCartButton.setAttribute("data-price", product.price.replace(/,/g, ""))
      addToCartButton.setAttribute("data-image", product.main_image)
    }
  }

  const loadSimilarProducts = async (container) =>  {
    if (!container) return;

    // Read category ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    try {
      let products = [];

      if (typeof ApiService !== "undefined" && ApiService.products && ApiService.products.getSimilarProductsById) {
        try {
          products = await ApiService.products.getSimilarProductsById(productId);
          console.log("Similar products loaded from API:", products);
        } catch (apiError) {
          console.error("Error fetching similar products:", apiError);
          showToast("Error loading similar products: " + apiError.message, "error");
          products = [];
        }
      }
      console.log(products)

      if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="bi bi-search display-1 text-muted"></i>
              <h3 class="mt-3">O'xshash mahsulotlar topilmadi</h3>
              <p class="text-muted">Boshqa mahsulotni ko'rib chiqing.</p>
            </div>
          `;
        return;
      }

      // Clear container
      container.innerHTML = "";

      // Render each product
      products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "col-md-3 mb-4";
        productCard.innerHTML = `
            <div class="product-card">
                    <div class="product-image">
                      <a href="/product.html?id=${product.id}">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                      </a>
                    </div>
                    <div class="product-info">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.price} so'm</p>
                        <a href="/product.html?id=${product.id}" class="btn btn-primary mt-auto">Batafsil</a>
                    </div>
                </div>
          `;
        container.appendChild(productCard);
      });

    } catch (error) {
      showError(container, error.message);
      console.error("Error loading similar products:", error);
    }
  };



  // Add thumbnail click functionality for manually added thumbnails
  const manualThumbnails = document.querySelectorAll(".thumbnail")
  const mainImage = document.querySelector(".main-image img")

  if (manualThumbnails.length > 0 && mainImage) {
    manualThumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        // Get the image source from the thumbnail
        const thumbnailImg = this.querySelector("img")
        if (thumbnailImg) {
          // Update main image - fix the path by removing the leading slash if present
          let imgSrc = thumbnailImg.src
          if (imgSrc.includes("/images/")) {
            // Convert absolute path to relative path if needed
            const pathParts = imgSrc.split("/images/")
            if (pathParts.length > 1) {
              imgSrc = "images/" + pathParts[1]
            }
          }
          mainImage.src = imgSrc

          // Update active thumbnail
          manualThumbnails.forEach((thumb) => {
            thumb.classList.remove("active")
          })
          this.classList.add("active")
        }
      })
    })
  }
})
  
  