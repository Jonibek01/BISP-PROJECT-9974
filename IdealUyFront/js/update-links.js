document.addEventListener("DOMContentLoaded", () => {
    // Add product ID to "Batafsil ko'rish" links on index page
    const detailLinks = document.querySelectorAll('.product-card a[href="product-detail.html"]')
  
    detailLinks.forEach((link) => {
      // Find the parent product card
      const productCard = link.closest(".product-card")
      if (productCard) {
        // Find the add to cart button to get the product ID
        const addToCartBtn = productCard.querySelector(".add-to-cart")
        if (addToCartBtn) {
          const productId = addToCartBtn.getAttribute("data-id")
          // Update the link href to include the product ID
          link.href = `product-detail.html?id=${productId}`
          console.log(`Updated link for product ${productId}: ${link.href}`)
        }
      }
    })
  
    // Also check for links in featured products section
    const featuredProductLinks = document.querySelectorAll('.featured-products a[href="product-detail.html"]')
    featuredProductLinks.forEach((link) => {
      const productCard = link.closest(".product-card")
      if (productCard) {
        const addToCartBtn = productCard.querySelector(".add-to-cart")
        if (addToCartBtn) {
          const productId = addToCartBtn.getAttribute("data-id")
          link.href = `product-detail.html?id=${productId}`
          console.log(`Updated featured product link for product ${productId}: ${link.href}`)
        }
      }
    })
  })
  
  