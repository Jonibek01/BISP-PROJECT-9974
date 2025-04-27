document.addEventListener("DOMContentLoaded", () => {
  // Getting URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const categoryParam = urlParams.get("category")

  // Updating category title and breadcrumb
  if (categoryParam) {
    const categoryTitle = document.querySelector(".category-title")
    const categoryName = document.querySelector(".category-name")
    const categoryLinks = document.querySelectorAll(".category-link")

    // Finding the matching category link to get the proper name
    let categoryDisplayName = "Barcha mahsulotlar"
    categoryLinks.forEach((link) => {
      if (link.dataset.category === categoryParam) {
        categoryDisplayName = link.textContent
        // Highlight active category
        link.parentElement.classList.add("active")
      } else {
        link.parentElement.classList.remove("active")
      }
    })

    if (categoryTitle) categoryTitle.textContent = categoryDisplayName
    if (categoryName) categoryName.textContent = categoryDisplayName

    // Filtering products
    filterProducts(categoryParam)
  }

  // Category link click handler
  const categoryLinks = document.querySelectorAll(".category-link")
  categoryLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const category = this.dataset.category

      // Updating URL without reloading page
      const url = new URL(window.location)
      url.searchParams.set("category", category)
      window.history.pushState({}, "", url)

      // Updating category title and breadcrumb
      const categoryTitle = document.querySelector(".category-title")
      const categoryName = document.querySelector(".category-name")

      if (categoryTitle) categoryTitle.textContent = this.textContent
      if (categoryName) categoryName.textContent = this.textContent

      // Highlight active category
      categoryLinks.forEach((link) => {
        link.parentElement.classList.remove("active")
      })
      this.parentElement.classList.add("active")

      // Filter products
      filterProducts(category)

      e.preventDefault()
    })
  })

  // Price filter
  const applyPriceFilterBtn = document.getElementById("applyPriceFilter")
  if (applyPriceFilterBtn) {
    applyPriceFilterBtn.addEventListener("click", () => {
      const minPrice = Number.parseInt(document.getElementById("minPrice").value) || 0
      const maxPrice = Number.parseInt(document.getElementById("maxPrice").value) || Number.POSITIVE_INFINITY

      filterProductsByPrice(minPrice, maxPrice)
    })
  }

  // Brand filter
  const brandFilters = document.querySelectorAll(".brand-filter")
  brandFilters.forEach((filter) => {
    filter.addEventListener("change", () => {
      filterProductsByBrand()
    })
  })

  // Sort products
  const sortSelect = document.getElementById("sortProducts")
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortProducts(this.value)
    })
  }

  // Filter functions
  function filterProducts(category) {
    const productItems = document.querySelectorAll(".product-item")
    let visibleCount = 0

    productItems.forEach((item) => {
      if (category === "all" || item.dataset.category === category) {
        item.style.display = "block"
        visibleCount++
      } else {
        item.style.display = "none"
      }
    })

    // Show/hide no results message
    const noResultsMessage = document.getElementById("noResults")
    if (noResultsMessage) {
      if (visibleCount === 0) {
        noResultsMessage.classList.remove("d-none")
      } else {
        noResultsMessage.classList.add("d-none")
      }
    }
  }

  function filterProductsByPrice(minPrice, maxPrice) {
    const productItems = document.querySelectorAll(".product-item")
    let visibleCount = 0

    productItems.forEach((item) => {
      const price = Number.parseInt(item.dataset.price) || 0

      if (price >= minPrice && price <= maxPrice && item.style.display !== "none") {
        item.style.display = "block"
        visibleCount++
      } else {
        item.style.display = "none"
      }
    })

    // Show/hide no results message
    const noResultsMessage = document.getElementById("noResults")
    if (noResultsMessage) {
      if (visibleCount === 0) {
        noResultsMessage.classList.remove("d-none")
      } else {
        noResultsMessage.classList.add("d-none")
      }
    }
  }

  function filterProductsByBrand() {
    const checkedBrands = Array.from(document.querySelectorAll(".brand-filter:checked")).map(
        (checkbox) => checkbox.value,
    )
    const productItems = document.querySelectorAll(".product-item")
    let visibleCount = 0

    productItems.forEach((item) => {
      const brand = item.dataset.brand

      if ((checkedBrands.length === 0 || checkedBrands.includes(brand)) && item.style.display !== "none") {
        item.style.display = "block"
        visibleCount++
      } else {
        item.style.display = "none"
      }
    })

    // Show/hide no results message
    const noResultsMessage = document.getElementById("noResults")
    if (noResultsMessage) {
      if (visibleCount === 0) {
        noResultsMessage.classList.remove("d-none")
      } else {
        noResultsMessage.classList.add("d-none")
      }
    }
  }

  function sortProducts(sortBy) {
    const productGrid = document.getElementById("productGrid")
    const productItems = Array.from(document.querySelectorAll(".product-item"))

    switch (sortBy) {
      case "price-low":
        productItems.sort((a, b) => {
          const priceA = Number.parseInt(a.querySelector(".price").dataset.price) || 0
          const priceB = Number.parseInt(b.querySelector(".price").dataset.price) || 0
          return priceA - priceB
        })
        break
      case "price-high":
        productItems.sort((a, b) => {
          const priceA = Number.parseInt(a.querySelector(".price").dataset.price) || 0
          const priceB = Number.parseInt(b.querySelector(".price").dataset.price) || 0
          return priceB - priceA
        })
        break
      case "name-asc":
        productItems.sort((a, b) => {
          const nameA = a.querySelector("h3").textContent.trim()
          const nameB = b.querySelector("h3").textContent.trim()
          return nameA.localeCompare(nameB)
        })
        break
      case "name-desc":
        productItems.sort((a, b) => {
          const nameA = a.querySelector("h3").textContent.trim()
          const nameB = b.querySelector("h3").textContent.trim()
          return nameB.localeCompare(nameA)
        })
        break
      default:
        // Default sorting (by featured)
        productItems.sort((a, b) => {
          return a.dataset.index - b.dataset.index
        })
    }

    // Reappend items in new order
    productItems.forEach((item) => {
      productGrid.appendChild(item)
    })
  }
})
  
  