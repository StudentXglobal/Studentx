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
<div id="toast" class="toast">
    <div class="toast-icon"></div>
    <div class="toast-content">
        <div id="toastTitle" class="toast-title"></div>
        <div id="toastMessage" class="toast-message"></div>
    </div>
</div>
/* ===== StudentX Toast ===== */

.toast{
    position:fixed;
    left:50%;
    bottom:25px;
    transform:translateX(-50%) translateY(120px);
    width:90%;
    max-width:360px;
    background:rgba(18,22,45,.95);
    backdrop-filter:blur(18px);
    border:1px solid rgba(255,255,255,.08);
    border-radius:18px;
    padding:16px;
    display:flex;
    align-items:flex-start;
    gap:14px;
    box-shadow:0 15px 40px rgba(0,0,0,.35);
    opacity:0;
    transition:.35s;
    z-index:99999;
}

.toast.show{
    opacity:1;
    transform:translateX(-50%) translateY(0);
}

.toast-icon{
    width:42px;
    height:42px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:20px;
    flex-shrink:0;
}

.toast.success .toast-icon{
    background:#18C964;
    color:#fff;
}

.toast.error .toast-icon{
    background:#FF3B30;
    color:#fff;
}

.toast.warning .toast-icon{
    background:#FF9F0A;
    color:#fff;
}

.toast-title{
    color:#fff;
    font-weight:700;
    font-size:15px;
    margin-bottom:3px;
}

.toast-message{
    color:#B8C0D4;
    font-size:13px;
    line-height:1.5;
                          }
