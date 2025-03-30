document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    function checkUserLogin() {
      const userData = JSON.parse(localStorage.getItem("userData"))
      const loggedInElements = document.querySelectorAll(".user-logged-in")
      const loggedOutElements = document.querySelectorAll(".user-logged-out")
  
      if (userData && userData.isLoggedIn) {
        // User is logged in
        loggedInElements.forEach((el) => el.classList.remove("d-none"))
        loggedOutElements.forEach((el) => el.classList.add("d-none"))
  
        // Set user name
        const userNameElements = document.querySelectorAll(".user-name")
        userNameElements.forEach((el) => {
          el.textContent = userData.firstName || "Kabinet"
        })
  
        // Set user initials
        const userInitialsElements = document.querySelectorAll(".user-initials")
        userInitialsElements.forEach((el) => {
          const initials = userData.firstName ? userData.firstName.charAt(0) : "U"
          el.textContent = initials
        })
  
        // Set user full name
        const userFullNameElements = document.querySelectorAll(".user-full-name")
        userFullNameElements.forEach((el) => {
          el.textContent = `${userData.firstName || ""} ${userData.lastName || ""}`
        })
  
        // Set user email
        const userEmailElements = document.querySelectorAll(".user-email")
        userEmailElements.forEach((el) => {
          el.textContent = userData.email || ""
        })
  
        // Fill profile form
        if (document.getElementById("firstName")) {
          document.getElementById("firstName").value = userData.firstName || ""
          document.getElementById("lastName").value = userData.lastName || ""
          document.getElementById("email").value = userData.email || ""
          document.getElementById("phone").value = userData.phone || ""
  
          if (userData.birthDate) {
            document.getElementById("birthDate").value = userData.birthDate
          }
  
          if (userData.gender) {
            if (userData.gender === "male") {
              document.getElementById("genderMale").checked = true
            } else if (userData.gender === "female") {
              document.getElementById("genderFemale").checked = true
            }
          }
        }
      } else {
        // User is not logged in, redirect to login page if on cabinet page
        if (window.location.pathname.includes("user-cabinet.html")) {
          window.location.href = "login.html"
        } else {
          loggedInElements.forEach((el) => el.classList.add("d-none"))
          loggedOutElements.forEach((el) => el.classList.remove("d-none"))
        }
      }
    }
  
    // Edit profile functionality
    const editProfileBtn = document.getElementById("editProfileBtn")
    const cancelEditBtn = document.getElementById("cancelEditBtn")
    const saveProfileBtn = document.getElementById("saveProfileBtn")
    const profileForm = document.getElementById("profileForm")
  
    if (editProfileBtn) {
      editProfileBtn.addEventListener("click", () => {
        // Enable form fields
        const formInputs = profileForm.querySelectorAll("input")
        formInputs.forEach((input) => {
          input.disabled = false
        })
  
        // Show save and cancel buttons
        saveProfileBtn.style.display = "block"
        cancelEditBtn.style.display = "block"
  
        // Hide edit button
        editProfileBtn.style.display = "none"
      })
    }
  
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => {
        // Disable form fields
        const formInputs = profileForm.querySelectorAll("input")
        formInputs.forEach((input) => {
          input.disabled = true
        })
  
        // Reset form values from localStorage
        const userData = JSON.parse(localStorage.getItem("userData"))
        if (userData) {
          document.getElementById("firstName").value = userData.firstName || ""
          document.getElementById("lastName").value = userData.lastName || ""
          document.getElementById("email").value = userData.email || ""
          document.getElementById("phone").value = userData.phone || ""
  
          if (userData.birthDate) {
            document.getElementById("birthDate").value = userData.birthDate
          }
  
          if (userData.gender) {
            if (userData.gender === "male") {
              document.getElementById("genderMale").checked = true
            } else if (userData.gender === "female") {
              document.getElementById("genderFemale").checked = true
            }
          }
        }
  
        // Hide save and cancel buttons
        saveProfileBtn.style.display = "none"
        cancelEditBtn.style.display = "none"
  
        // Show edit button
        editProfileBtn.style.display = "block"
      })
    }
  
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Get form values
        const firstName = document.getElementById("firstName").value
        const lastName = document.getElementById("lastName").value
        const email = document.getElementById("email").value
        const phone = document.getElementById("phone").value
        const birthDate = document.getElementById("birthDate").value
        const gender = document.querySelector('input[name="gender"]:checked').value
  
        // Get existing user data
        const userData = JSON.parse(localStorage.getItem("userData")) || {}
  
        // Update user data
        userData.firstName = firstName
        userData.lastName = lastName
        userData.email = email
        userData.phone = phone
        userData.birthDate = birthDate
        userData.gender = gender
  
        // Save to localStorage
        localStorage.setItem("userData", JSON.stringify(userData))
  
        // Disable form fields
        const formInputs = profileForm.querySelectorAll("input")
        formInputs.forEach((input) => {
          input.disabled = true
        })
  
        // Hide save and cancel buttons
        saveProfileBtn.style.display = "none"
        cancelEditBtn.style.display = "none"
  
        // Show edit button
        editProfileBtn.style.display = "block"
  
        // Update displayed user info
        const userFullNameElements = document.querySelectorAll(".user-full-name")
        userFullNameElements.forEach((el) => {
          el.textContent = `${firstName} ${lastName}`
        })
  
        const userEmailElements = document.querySelectorAll(".user-email")
        userEmailElements.forEach((el) => {
          el.textContent = email
        })
  
        const userInitialsElements = document.querySelectorAll(".user-initials")
        userInitialsElements.forEach((el) => {
          el.textContent = firstName.charAt(0)
        })
  
        // Show success message
        alert("Profil muvaffaqiyatli yangilandi!")
      })
    }
  
    // Change password functionality
    const changePasswordForm = document.getElementById("changePasswordForm")
    if (changePasswordForm) {
      changePasswordForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        const currentPassword = document.getElementById("currentPassword").value
        const newPassword = document.getElementById("newPassword").value
        const confirmPassword = document.getElementById("confirmPassword").value
  
        // Validate passwords
        if (newPassword !== confirmPassword) {
          alert("Yangi parol va tasdiqlash paroli bir xil emas!")
          return
        }
  
        if (newPassword.length < 8) {
          alert("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak!")
          return
        }
  
        // In a real app, you would send this to the server
        // For demo purposes, we'll just show a success message
        alert("Parol muvaffaqiyatli o'zgartirildi!")
  
        // Reset form
        changePasswordForm.reset()
      })
    }
  
    // Add new address functionality
    const saveAddressBtn = document.getElementById("saveAddressBtn")
    if (saveAddressBtn) {
      saveAddressBtn.addEventListener("click", () => {
        const addressName = document.getElementById("addressName").value
        const fullName = document.getElementById("fullName").value
        const addressPhone = document.getElementById("addressPhone").value
        const region = document.getElementById("region").value
        const district = document.getElementById("district").value
        const street = document.getElementById("street").value
        const postalCode = document.getElementById("postalCode").value
        const makeDefault = document.getElementById("makeDefault").checked
  
        // Validate required fields
        if (!fullName || !addressPhone || !region || !district || !street) {
          alert("Iltimos, barcha majburiy maydonlarni to'ldiring!")
          return
        }
  
        // In a real app, you would send this to the server
        // For demo purposes, we'll just show a success message and close the modal
        alert("Manzil muvaffaqiyatli qo'shildi!")
  
        // Get the modal instance
        const modalElement = document.getElementById("addAddressModal")
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement)
        modal.hide()
  
        // Reset form
        document.getElementById("addAddressForm").reset()
  
        // Reload page to show new address (in a real app, you would update the DOM)
        // window.location.reload();
      })
    }
  
    // Logout functionality
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
  
        // Get existing user data
        const userData = JSON.parse(localStorage.getItem("userData")) || {}
  
        // Set logged out status
        userData.isLoggedIn = false
  
        // Save to localStorage
        localStorage.setItem("userData", JSON.stringify(userData))
  
        // Redirect to home page
        window.location.href = "index.html"
      })
    }
  
    // Check login status on page load
    checkUserLogin()
  
    // Initialize Bootstrap Modals (if not already initialized)
    var myModal = document.getElementById("addAddressModal")
    if (myModal) {
      myModal.addEventListener("shown.bs.modal", () => {})
    }
  })
 
  