
console.log("Auth.js loaded");


document.addEventListener("DOMContentLoaded", () => {
  // Checking if user is already logged in
  function checkUserLogin() {
    const userData = JSON.parse(localStorage.getItem("userData"))
    const loggedInElements = document.querySelectorAll(".user-logged-in")
    const loggedOutElements = document.querySelectorAll(".user-logged-out")

    if (userData && userData.isLoggedIn) {
      // User is logged in
      loggedInElements.forEach((el) => el.classList.remove("d-none"))
      loggedOutElements.forEach((el) => el.classList.add("d-none"))

      // Setting username
      const userNameElements = document.querySelectorAll(".user-name")
      userNameElements.forEach((el) => {
        el.textContent = userData.firstName || "Kabinet"
      })

      // If on login or signup page, redirect to home
      if (window.location.pathname.includes("login.html") || window.location.pathname.includes("signup.html")) {
        window.location.href = "index.html"
      }
    } else {
      // User is not logged in
      loggedInElements.forEach((el) => el.classList.add("d-none"))
      loggedOutElements.forEach((el) => el.classList.remove("d-none"))
    }
  }

  // Login form submission
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value



      const userData = {
        email: email,
        firstName: "Aziz",
        lastName: "Karimov",
        phone: "+998 90 123 45 67",
        birthDate: "1990-05-15",
        gender: "male",
        isLoggedIn: true,
      }

      // Saving to localStorage
      localStorage.setItem("userData", JSON.stringify(userData))

      // Redirecting to user cabinet
      window.location.href = "user-cabinet.html"
    })
    console.log("Login form submitted", email, password);
    console.log("User data being saved:", userData);
  }

  // Signup form submission
  const signupForm = document.getElementById("signupForm")
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const firstName = document.getElementById("firstName").value
      const lastName = document.getElementById("lastName").value
      const email = document.getElementById("email").value
      const phone = document.getElementById("phone").value
      const password = document.getElementById("password").value
      const confirmPassword = document.getElementById("confirmPassword").value

      // Validate passwords match
      if (password !== confirmPassword) {
        alert("Parollar mos kelmaydi!")
        return
      }


      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        isLoggedIn: true,
      }

      // Save to localStorage
      localStorage.setItem("userData", JSON.stringify(userData))

      // Redirect to user cabinet
      window.location.href = "user-cabinet.html"
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
})
  
  