document.getElementById("mainBtn").addEventListener("click", async function () {

    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passInput").value;

    if (!email) {
        showMsg("Please enter your email.");
        return;
    }

    if (!password) {
        showMsg("Please enter your password.");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        showMsg(error.message);
        return;
    }

    showMsg("Login successful!");

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1000);

});
