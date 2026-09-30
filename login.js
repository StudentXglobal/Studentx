document.getElementById("mainBtn").addEventListener("click", loginUser);

async function loginUser() {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passInput").value;

  if (!email || !password) {
    showMsg("Please enter email and password");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    showMsg("Invalid email or password");
    return;
  }

  showMsg("Login successful");

  setTimeout(() => {
    window.location.href = "home.html";
  }, 1000);
}

/* Google OAuth Login */
async function googleLogin() {
  if (typeof supabaseClient === "undefined") {
    showMsg("Authentication is still loading. Please try again.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://studentx-ew9e.vercel.app/home.html"
    }
  });

  if (error) {
    showMsg(error.message || "Google login failed");
  }
}
