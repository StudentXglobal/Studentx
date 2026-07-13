const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const university = document.getElementById("university").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

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

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Create account
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
        return;
    }

    const user = data.user;

    if (!user) {
        alert("Please confirm your email first.");
        return;
    }

    // Save profile
    const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert([
            {
                id: user.id,
                full_name: fullName,
                username: username,
                university: university,
                email: email
            }
        ]);

    if (profileError) {
        alert(profileError.message);
        console.log(profileError);
        return;
    }

    alert("Account created successfully!");

    window.location.href = "login.html";
});
