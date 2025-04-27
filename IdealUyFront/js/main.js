// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initializing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Adding to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');

            // Getting quantity if available (for product detail page)
            let quantity = 1;
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) {
                quantity = parseInt(quantityInput.value);
            }

            // Checking if product already in cart
            const existingProductIndex = cart.findIndex(item => item.id === productId);

            if (existingProductIndex > -1) {
                // Updating quantity if product already in cart
                cart[existingProductIndex].quantity += quantity;
            } else {
                // Adding new product to cart
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: quantity
                });
            }

            // Saving cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Updating cart count
            updateCartCount();

            // Showing cart modal
            const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
            updateCartModal();
            cartModal.show();
        });
    });

    // Quantity buttons on product detail page
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    const quantityInput = document.getElementById('quantity');

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });

        increaseBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value);
            quantityInput.value = quantity + 1;
        });
    }

    // Cart page functionality
    const cartItemsList = document.getElementById('cartItemsList');
    if (cartItemsList) {
        if (cart.length === 0) {
            document.getElementById('emptyCartMessage').style.display = 'block';
        } else {
            document.getElementById('emptyCartMessage').style.display = 'none';
            renderCartItems();
        }
    }

    // Checkout page functionality
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            window.location.href = 'confirmation.html';
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real app, you would validate and send to server
            // For demo, just redirect to index
            // window.location.href = 'index.html';
        });
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real app, you would validate and send to server
            // For demo, redirect to verification page
            window.location.href = 'verification.html';
        });
    }

    // Verification code input
    const verificationInputs = document.querySelectorAll('.verification-input');
    if (verificationInputs.length > 0) {
        verificationInputs.forEach((input, index) => {
            input.addEventListener('input', function() {
                if (this.value.length === this.maxLength) {
                    if (index < verificationInputs.length - 1) {
                        verificationInputs[index + 1].focus();
                    }
                }
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value.length === 0) {
                    if (index > 0) {
                        verificationInputs[index - 1].focus();
                    }
                }
            });
        });

        // Timer for resend code
        let timeLeft = 45;
        const timerElement = document.getElementById('timer');
        const resendButton = document.getElementById('resendCode');

        const timer = setInterval(function() {
            timeLeft--;
            timerElement.textContent = timeLeft + 's';

            if (timeLeft <= 0) {
                clearInterval(timer);
                timerElement.style.display = 'none';
                resendButton.classList.remove('text-muted');
            }
        }, 1000);
    }

    // Helper functions
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    function updateCartModal() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');

        if (cartItemsContainer && cartTotalElement) {
            cartItemsContainer.innerHTML = '';

            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item d-flex align-items-center mb-3';
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="img-fluid me-3" style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <div class="d-flex justify-content-between">
                            <span>${item.quantity} x ${item.price.toLocaleString()} so'm</span>
                            <span>${(item.price * item.quantity).toLocaleString()} so'm</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-2 remove-from-cart" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                cartItemsContainer.appendChild(cartItemElement);
            });

            cartTotalElement.textContent = total.toLocaleString();

            // Add event listeners to remove buttons
            const removeButtons = document.querySelectorAll('.remove-from-cart');
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    removeFromCart(productId);
                    updateCartModal();
                });
            });
        }
    }

    function renderCartItems() {
        cartItemsList.innerHTML = '';

        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item d-flex align-items-center mb-3';
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
            `;

            cartItemsList.appendChild(cartItemElement);
        });

        // Update order summary
        document.getElementById('subtotal').textContent = `₹${total.toLocaleString()}`;
        document.getElementById('totalPrice').textContent = `₹${total.toLocaleString()}`;

        // Add event listeners
        const decreaseButtons = document.querySelectorAll('.decrease-quantity');
        const increaseButtons = document.querySelectorAll('.increase-quantity');
        const quantityInputs = document.querySelectorAll('.quantity-selector input');
        const removeButtons = document.querySelectorAll('.remove-from-cart');

        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateCartItemQuantity(productId, -1);
            });
        });

        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateCartItemQuantity(productId, 1);
            });
        });

        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                const newQuantity = parseInt(this.value);

                if (newQuantity > 0) {
                    setCartItemQuantity(productId, newQuantity);
                } else {
                    this.value = 1;
                    setCartItemQuantity(productId, 1);
                }
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });

        // Gift box checkbox
        const giftBoxCheckbox = document.getElementById('giftBox');
        if (giftBoxCheckbox) {
            giftBoxCheckbox.addEventListener('change', function() {
                updateOrderSummary();
            });
        }
    }

    function updateCartItemQuantity(productId, change) {
        const index = cart.findIndex(item => item.id === productId);

        if (index > -1) {
            cart[index].quantity += change;

            if (cart[index].quantity < 1) {
                cart[index].quantity = 1;
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }

    function setCartItemQuantity(productId, quantity) {
        const index = cart.findIndex(item => item.id === productId);

        if (index > -1) {
            cart[index].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();

        if (cartItemsList) {
            if (cart.length === 0) {
                document.getElementById('emptyCartMessage').style.display = 'block';
            }
            renderCartItems();
        }
    }

    function updateOrderSummary() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const giftBoxCheckbox = document.getElementById('giftBox');
        const giftBoxPrice = giftBoxCheckbox && giftBoxCheckbox.checked ? 10.90 : 0;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('totalPrice').textContent = `₹${(subtotal + giftBoxPrice).toFixed(2)}`;
    }

    // Product thumbnails on product detail page
    const thumbnails = document.querySelectorAll('.thumbnail');
    if (thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));

                // Add active class to clicked thumbnail
                this.classList.add('active');

                // Update main image
                const mainImage = document.querySelector('.main-image img');
                mainImage.src = this.querySelector('img').src;
            });
        });
    }

    // Color options on product detail page
    const colorOptions = document.querySelectorAll('.color-option');
    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all color options
                colorOptions.forEach(o => o.classList.remove('active'));

                // Add active class to clicked color option
                this.classList.add('active');
            });
        });
    }

    // Calculating savings
    function calculateSavings(originalPrice, salePrice) {
        return originalPrice - salePrice;
    }

    // Formating currency
    function formatCurrency(amount) {
        return amount.toLocaleString() + ' so\'m';
    }

    // Displaying savings on product cards with original price
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const originalPriceElement = card.querySelector('.original-price');
        const salePriceElement = card.querySelector('.price');

        if (originalPriceElement && salePriceElement) {
            const originalPrice = parseFloat(originalPriceElement.getAttribute('data-price'));
            const salePrice = parseFloat(salePriceElement.getAttribute('data-price'));

            if (originalPrice > salePrice) {
                const savings = calculateSavings(originalPrice, salePrice);
                const savingsElement = document.createElement('div');
                savingsElement.className = 'savings text-success';
                savingsElement.textContent = 'Save ' + formatCurrency(savings);
                salePriceElement.after(savingsElement);
            }
        }
    });
});