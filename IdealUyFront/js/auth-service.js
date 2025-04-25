/*
 * Authentication Service for IdealUy.uz
 * Handles user authentication, registration, and profile management
 */

// Mock ApiService for development/testing purposes
const MockApiService = {
  auth: {
    login: async (email, password) => {
      // Simulate API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === "test@example.com" && password === "password") {
            const userData = {
              isLoggedIn: true,
              email: email,
              firstName: "Test",
              lastName: "User",
              phone: "+998 90 123 45 67",
              token: "demo-token-12345",
            }
            localStorage.setItem("userData", JSON.stringify(userData))
            resolve()
          } else {
            reject(new Error("Noto'g'ri email yoki parol"))
          }
        }, 1000)
      })
    },
    register: async (userData) => {
      // Simulate API call
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Save user data to localStorage (for demo purposes)
          localStorage.setItem(
            "userData",
            JSON.stringify({
              ...userData,
              isLoggedIn: true,
              token: "demo-token-" + Math.random().toString(36).substring(2, 10),
            }),
          )
          resolve()
        }, 1000)
      })
    },
    logout: () => {
      localStorage.removeItem("userData")
    },
    verifyPhone: async (phone, code) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (code === "1234") {
            resolve()
          } else {
            reject(new Error("Noto'g'ri kod"))
          }
        }, 1000)
      })
    },
  },
  user: {
    getProfile: async () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")
          resolve(userData)
        }, 500)
      })
    },
  },
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const checkUserLogin = () => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    const isLoggedIn = userData.isLoggedIn || false

    console.log("Checking login status:", isLoggedIn)

    const loggedInElements = document.querySelectorAll(".user-logged-in")
    const loggedOutElements = document.querySelectorAll(".user-logged-out")

    if (isLoggedIn) {
      // User is logged in
      console.log("User is logged in, showing logged-in elements")
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

      // Fill profile form if on profile page
      if (document.getElementById("firstName")) {
        loadUserProfile()
      }
    } else {
      // User is not logged in
      console.log("User is not logged in, showing logged-out elements")
      loggedInElements.forEach((el) => el.classList.add("d-none"))
      loggedOutElements.forEach((el) => el.classList.remove("d-none"))

      // Redirect to login page if on cabinet page
      if (window.location.pathname.includes("user-cabinet.html")) {
        window.location.href = "login.html"
      }
    }
  }

  // Load user profile data from API or localStorage
  const loadUserProfile = async () => {
    try {
      // Show loading state
      const profileForm = document.getElementById("profileForm")
      if (profileForm) {
        profileForm.classList.add("loading")
      }

      let userData = {}
      // Try to get profile data from API if user is logged in
      if (ApiService.auth.isLoggedIn()) {
        try {
          userData = await ApiService.user.getProfile()
          console.log("Profile data loaded from API:", userData)

          // Update localStorage with latest data
          const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
          const updatedUserData = { ...storedUserData, ...userData, isLoggedIn: true }
          localStorage.setItem("userData", JSON.stringify(updatedUserData))
        } catch (apiError) {
          console.error("Error loading profile from API:", apiError)
          // Fallback to localStorage if API fails
          userData = JSON.parse(localStorage.getItem("userData") || "{}")
        }
      } else {
        // Get profile data from localStorage
        userData = JSON.parse(localStorage.getItem("userData") || "{}")
      }

      // Fill form fields
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

      // Hide loading state
      if (profileForm) {
        profileForm.classList.remove("loading")
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      showToast("Profil ma'lumotlarini yuklashda xatolik yuz berdi", "error")
    }
  }

  // Initialize login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    console.log("Login form found, adding submit event listener")
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Login form submitted")

      const username = document.getElementById("loginUsername").value
      const password = document.getElementById("loginPassword").value

      console.log("Login attempt with username:", username)

      try {
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]')
        const originalButtonText = submitButton.innerHTML
        submitButton.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
        submitButton.disabled = true
        
        // Try to use ApiService for login
        try {
          if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.login) {
            await ApiService.auth.login(username, password)

            // Show success message
            showToast("Muvaffaqiyatli kirildi!")

            // Redirect to home page or previous page
            const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "index.html"
            window.location.href = redirectUrl
          } else {
            // Fallback for development/testing
            console.warn("ApiService not available, using mock login")

            // Create user data
            const userData = {
              isLoggedIn: true,
              username: username,
              firstName: "Demo",
              lastName: "User",
              phone: "+998 90 123 45 67",
              token: "demo-token-12345",
            }

            // Save to localStorage
            localStorage.setItem("userData", JSON.stringify(userData))

            // Show success message
            showToast("Muvaffaqiyatli kirildi!")

            // Redirect to home page
            window.location.href = "index.html"
          }
        } catch (apiError) {
          console.error("API login error:", apiError)

          // Show error message
          const errorElement = document.getElementById("loginError")
          if (errorElement) {
            errorElement.textContent = apiError.message || "Noto'g'ri foydalanuvchi nomi yoki parol"
            errorElement.classList.remove("d-none")
          }

          // Reset button
          if (submitButton) {
            submitButton.innerHTML = originalButtonText
            submitButton.disabled = false
          }
        }
      } catch (error) {
        console.error("Login error:", error)

        // Show error message
        const errorElement = document.getElementById("loginError")
        if (errorElement) {
          errorElement.textContent = error.message || "Login failed. Please check your credentials."
          errorElement.classList.remove("d-none")
        }

        // Reset button
        const submitButton = loginForm.querySelector('button[type="submit"]')
        if (submitButton) {
          submitButton.innerHTML = originalButtonText || "Kirish"
          submitButton.disabled = false
        }
      }
    })
  } else {
    console.log("Login form not found on this page")
  }


  // Initialize signup form
  const signupForm = document.getElementById("signupForm")
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const firstName = document.getElementById("firstName").value
      const lastName = document.getElementById("lastName").value
      const email = document.getElementById("email").value
      const phone = document.getElementById("phone").value
      const password = document.getElementById("password").value
      const confirmPassword = document.getElementById("confirmPassword").value

      // Validate passwords match
      if (password !== confirmPassword) {
        const errorElement = document.getElementById("signupError")
        if (errorElement) {
          errorElement.textContent = "Passwords do not match"
          errorElement.classList.remove("d-none")
        }
        return
      }

      try {
        // Show loading state
        const submitButton = signupForm.querySelector('button[type="submit"]')
        const originalButtonText = submitButton.innerHTML
        submitButton.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
        submitButton.disabled = true

        // Try to use ApiService for registration
        try {
          if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.register) {
            const userData = {
              firstName,
              lastName,
              email,
              phone,
              password,
            }

            await ApiService.auth.register(userData)

            // Show success message
            showToast("Muvaffaqiyatli ro'yxatdan o'tildi!")

            // Redirect to verification page or login page
            window.location.href = "verification.html"
          } else {
            // Fallback for development/testing
            console.warn("ApiService not available, using mock registration")

            // Create user data
            const userData = {
              isLoggedIn: true,
              email: email,
              firstName: firstName,
              lastName: lastName,
              phone: phone,
              token: "demo-token-" + Math.random().toString(36).substring(2, 10),
            }

            // Save to localStorage
            localStorage.setItem("userData", JSON.stringify(userData))

            // Show success message
            showToast("Muvaffaqiyatli ro'yxatdan o'tildi!")

            // Redirect to home page
            window.location.href = "index.html"
          }
        } catch (apiError) {
          console.error("API registration error:", apiError)

          // Show error message
          const errorElement = document.getElementById("signupError")
          if (errorElement) {
            errorElement.textContent = apiError.message || "Registration failed. Please try again."
            errorElement.classList.remove("d-none")
          }

          // Reset button
          if (submitButton) {
            submitButton.innerHTML = originalButtonText
            submitButton.disabled = false
          }
        }
      } catch (error) {
        console.error("Signup error:", error)

        // Show error message
        const errorElement = document.getElementById("signupError")
        if (errorElement) {
          errorElement.textContent = error.message || "Registration failed. Please try again."
          errorElement.classList.remove("d-none")
        }

        // Reset button
        const submitButton = signupForm.querySelector('button[type="submit"]')
        if (submitButton) {
          submitButton.innerHTML = originalButtonText || "Ro'yxatdan o'tish"
          submitButton.disabled = false
        }
      }
    })
  }

  // Verification code handling
  const verificationForm = document.querySelector(".verification-code")
  if (verificationForm) {
    const verificationInputs = document.querySelectorAll(".verification-input")
    const submitButton = document.querySelector(".verification-section button[type='submit']")

    // Auto-focus next input when a digit is entered
    verificationInputs.forEach((input, index) => {
      input.addEventListener("input", function () {
        if (this.value.length === this.maxLength) {
          if (index < verificationInputs.length - 1) {
            verificationInputs[index + 1].focus()
          } else {
            // Check if all inputs are filled
            const allFilled = Array.from(verificationInputs).every((input) => input.value.length === input.maxLength)
            if (allFilled && submitButton) {
              submitButton.focus()
            }
          }
        }
      })

      // Handle backspace to go to previous input
      input.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && this.value.length === 0) {
          if (index > 0) {
            verificationInputs[index - 1].focus()
          }
        }
      })
    })

    // Handle verification form submission
    if (submitButton) {
      submitButton.addEventListener("click", async function (e) {
        e.preventDefault()

        // Get verification code
        const code = Array.from(verificationInputs)
          .map((input) => input.value)
          .join("")

        if (code.length !== verificationInputs.length) {
          showToast("Please enter the complete verification code", "error")
          return
        }

        try {
          // Show loading state
          const originalButtonText = this.innerHTML
          this.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
          this.disabled = true

          // Get phone number from page or localStorage
          const phoneElement = document.querySelector(".verification-section p.mb-1")
          const phone = phoneElement ? phoneElement.textContent : ""

          // Try to use ApiService for verification
          if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.verifyPhone) {
            try {
              await ApiService.auth.verifyPhone(phone, code)

              // Show success message
              showToast("Phone verification successful!")

              // Redirect to login page
              window.location.href = "login.html"
            } catch (apiError) {
              console.error("API verification error:", apiError)

              // Show error message
              showToast(apiError.message || "Verification failed. Please try again.", "error")

              // Reset button
              this.innerHTML = originalButtonText
              this.disabled = false
            }
          } else {
            // Fallback for development/testing
            console.warn("ApiService not available, using mock verification")

            // Simulate successful verification
            setTimeout(() => {
              // Show success message
              showToast("Phone verification successful!")

              // Redirect to login page
              window.location.href = "login.html"
            }, 1500)
          }
        } catch (error) {
          console.error("Verification error:", error)

          // Show error message
          showToast(error.message || "Verification failed. Please try again.", "error")

          // Reset button
          this.innerHTML = originalButtonText || "Submit"
          this.disabled = false
        }
      })
    }

    // Handle resend code
    const resendButton = document.getElementById("resendCode")
    const timerElement = document.getElementById("timer")

    if (resendButton && timerElement) {
      let timeLeft = 45
      let timer

      // Start timer
      const startTimer = () => {
        timeLeft = 45
        timerElement.textContent = timeLeft + "s"
        timerElement.style.display = "block"
        resendButton.classList.add("text-muted")
        resendButton.style.pointerEvents = "none"

        clearInterval(timer)
        timer = setInterval(() => {
          timeLeft--
          timerElement.textContent = timeLeft + "s"

          if (timeLeft <= 0) {
            clearInterval(timer)
            timerElement.style.display = "none"
            resendButton.classList.remove("text-muted")
            resendButton.style.pointerEvents = "auto"
          }
        }, 1000)
      }

      // Initialize timer on page load
      startTimer()

      // Handle resend button click
      resendButton.addEventListener("click", async function (e) {
        e.preventDefault()

        if (this.classList.contains("text-muted")) {
          return
        }

        try {
          // Get phone number from page
          const phoneElement = document.querySelector(".verification-section p.mb-1")
          const phone = phoneElement ? phoneElement.textContent : ""

          if (!phone) {
            showToast("Phone number not found", "error")
            return
          }

          // Try to use ApiService to resend code
          if (typeof ApiService !== "undefined" && ApiService.auth) {
            try {
              // This would be a specific endpoint for resending verification code
              // For now, we'll just show a success message
              showToast("Verification code resent successfully")
            } catch (apiError) {
              console.error("API resend code error:", apiError)
              showToast(apiError.message || "Failed to resend code", "error")
            }
          } else {
            // Fallback for development/testing
            showToast("Verification code resent successfully")
          }

          // Restart timer
          startTimer()
        } catch (error) {
          console.error("Resend code error:", error)
          showToast(error.message || "Failed to resend code", "error")
        }
      })
    }
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Logout button clicked")

      try {
        // Try to use ApiService for logout
        if (typeof ApiService !== "undefined" && ApiService.auth && ApiService.auth.logout) {
          ApiService.auth.logout()
        } else {
          // Fallback for development/testing
          console.warn("ApiService not available, using local logout")

          // Get existing user data
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")

          // Set logged out status
          userData.isLoggedIn = false

          // Save to localStorage
          localStorage.setItem("userData", JSON.stringify(userData))
        }

        // Show success message
        showToast("Muvaffaqiyatli chiqildi!")

        // Redirect to home page
        window.location.href = "index.html"
      } catch (error) {
        console.error("Logout error:", error)
        showToast("Logout failed: " + error.message, "error")
      }
    })
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

  // Check login status on page load
  checkUserLogin()
})

