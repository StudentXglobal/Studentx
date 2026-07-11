// Get form elements
const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const university = document.getElementById("university").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check empty fields
    if (
        !fullName ||
        !username ||
        !university ||
        !email ||
        !password ||
        !confirmPassword
    ) {
        alert("Please fill in all fields.");
        return;
    }

    // Check password match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    alert("Form validation successful. Part 1 completed.");
});
