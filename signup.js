const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async function (e) {
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

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: "https://studentx-ew9e.vercel.app",
                data: {
                    full_name: fullName,
                    username: username,
                    university: university
                }
            }
        });

        if (error) {
            alert(error.message);
            console.error(error);
            return;
        }

        alert("Account created successfully! Please check your email.");

        console.log(data);

    } catch (err) {
        console.error(err);
        alert("Unexpected error: " + err.message);
    }
});
