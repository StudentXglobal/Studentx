function getReferralCodeFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return (params.get("ref") || "").trim();
}

function showMsg(text){
    const old = document.querySelector(".toast");
    if (old) old.remove();

    const d = document.createElement("div");
    d.className = "toast";
    d.textContent = text;
    document.body.appendChild(d);

    setTimeout(() => {
        if (d.parentNode) d.remove();
    }, 3200);
}

function validName(v){
    return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v);
}

function validUsername(v){
    return /^[A-Za-z0-9_]+$/.test(v);
}

async function usernameAvailable(username){
    const normalized = username.trim().toLowerCase();

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id,username")
        .ilike("username", normalized)
        .limit(1);

    if (error) throw error;

    return !(data && data.length);
}

async function createProfile(user, extra){
    const referralCode = getReferralCodeFromUrl();
    let referredBy = null;

    if (referralCode) {
        try {
            const refRes = await supabaseClient
                .from("profiles")
                .select("id")
                .eq("referral_code", referralCode)
                .maybeSingle();

            if (refRes.data && refRes.data.id !== user.id) {
                referredBy = refRes.data.id;
            }
        } catch (e) {
            console.warn("Referral lookup skipped:", e);
        }
    }

    const payload = {
        id: user.id,
        full_name: extra.fullName,
        username: extra.username,
        university: extra.university || null,
        email: extra.email || null
    };

    if (referredBy) {
        payload.referred_by = referredBy;
    }

    const { error } = await supabaseClient
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

    if (error) throw error;

    return referredBy;
}

/* =========================
   SIGN UP
========================= */

document.getElementById("signupBtn").addEventListener("click", async () => {

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const university = document.getElementById("university").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullName || !validName(fullName)) {
        showMsg("Please enter your full name (letters only).");
        return;
    }

    if (!username || !validUsername(username) || username.length < 3) {
        showMsg("Username must be at least 3 characters: letters, numbers, underscore only.");
        return;
    }

    if (!email || email.indexOf("@") === -1) {
        showMsg("Please enter a valid email address.");
        return;
    }

    if (!password || password.length < 6) {
        showMsg("Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showMsg("Passwords do not match.");
        return;
    }

    const btn = document.getElementById("signupBtn");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {

        const available = await usernameAvailable(username);
        if (!available) {
            showMsg("Username already taken.");
            return;
        }

        const redirectUrl = new URL("home.html", window.location.href).href;

        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: fullName,
                    username: username,
                    university: university || null
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Could not create your account.");

        await createProfile(authData.user, { fullName, username, university, email });

        showMsg("We sent a verification email. Check your inbox.");

        setTimeout(() => {
            window.location.href = "login.html?verify=email";
        }, 1800);

    } catch (err) {
        console.error(err);
        showMsg(err.message || "Could not create your account.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Create Account";
    }
});
