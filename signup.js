if (error) {
    alert(error.message);
    return;
}

alert("Account created successfully! Please check your email and confirm your account.");

window.location.href = "login.html";
