const signupBtn = document.getElementById("signupBtn");

const REFERRAL_BONUS = 0.50;

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
    setTimeout(() => { if (d.parentNode) d.remove(); }, 2800);
}

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
        showMsg("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        showMsg("Passwords do not match.");
        return;
    }

    if (password.length < 6) {
        showMsg("Password must be at least 6 characters.");
        return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";

    // Captured once, up front, in case the URL changes during the request
    const referralCode = getReferralCodeFromUrl();

    try {
        // Create the account
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

        if (error) throw error;

        const user = data.user;

        if (!user) {
            showMsg("Please confirm your email first, then log in.");
            return;
        }

        // Resolve the referrer (if a valid ?ref=CODE was used)
        let referredBy = null;
        if (referralCode) {
            const refRes = await supabaseClient
                .from("profiles")
                .select("id")
                .eq("referral_code", referralCode)
                .maybeSingle();

            if (refRes.data && refRes.data.id !== user.id) {
                referredBy = refRes.data.id;
            }
        }

        // Save profile
        const profilePayload = {
            id: user.id,
            full_name: fullName,
            username: username,
            university: university,
            email: email
        };
        if (referredBy) profilePayload.referred_by = referredBy;

        const { error: profileError } = await supabaseClient
            .from("profiles")
            .insert([profilePayload]);

        if (profileError) {
            console.error(profileError);
            showMsg(profileError.message || "Could not create your profile.");
            return;
        }

        // Credit the referrer — best-effort. A signup should still
        // succeed even if this secondary step fails for any reason.
        if (referredBy) {
            try {
                const refInsert = await supabaseClient.from("referrals").insert({
                    referrer_id: referredBy,
                    referred_id: user.id,
                    bonus_amount: REFERRAL_BONUS
                });

                if (!refInsert.error) {
                    await supabaseClient.from("earnings").insert({
                        user_id: referredBy,
                        source: "referral",
                        amount: REFERRAL_BONUS,
                        description: fullName + " joined using your referral link"
                    });
                } else {
                    console.warn("Referral record not created:", refInsert.error.message);
                }
            } catch (refErr) {
                console.warn("Referral credit skipped:", refErr);
            }
        }

        showMsg("Account created successfully!");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (err) {
        console.error(err);
        showMsg(err.message || "Could not create your account.");
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = "Create Account";
    }
});
