// Get form elements
const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const university = document.getElementById("university").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
        fullName === "" ||
        username === "" ||
        university === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        data: {
            full_name: fullName,
            username: username,
            university: university
        }
    }
});

if (error) {
    alert(error.message);
    return;
}

alert("Account created successfully!\n\nPlease check your email and click the verification link.");
});
