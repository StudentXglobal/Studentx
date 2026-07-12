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
