function getReferralCodeFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return (params.get("ref") || "").trim();
}

function showMsg(text){
    const old = document.querySelector(".toast");
    if(old) old.remove();

    const d = document.createElement("div");
    d.className = "toast";
    d.textContent = text;
    document.body.appendChild(d);

    setTimeout(() => {
        if(d.parentNode) d.remove();
    }, 3200);
}

function normalizeNigeriaPhone(phone){
    let p = String(phone || "").trim().replace(/[\s()-]/g,"");

    if(p.startsWith("+234")) return p;
    if(p.startsWith("234")) return "+" + p;
    if(/^0\d{10}$/.test(p)) return "+234" + p.slice(1);

    return p;
}

function validNigeriaPhone(phone){
    return /^\+234\d{10}$/.test(normalizeNigeriaPhone(phone));
}

async function usernameAvailable(username){
    const normalized = username.trim().toLowerCase();

    const {data,error} = await supabaseClient
        .from("profiles")
        .select("id,username")
        .ilike("username",normalized)
        .limit(1);

    if(error) throw error;

    return !(data && data.length);
}

async function createProfile(user,extra){
    const referralCode = getReferralCodeFromUrl();
    let referredBy = null;

    if(referralCode){
        try{
            const refRes = await supabaseClient
                .from("profiles")
                .select("id")
                .eq("referral_code",referralCode)
                .maybeSingle();

            if(refRes.data && refRes.data.id !== user.id){
                referredBy = refRes.data.id;
            }
        }catch(e){
            console.warn("Referral lookup skipped:",e);
        }
    }

    const payload = {
        id:user.id,
        first_name:extra.firstName,
        surname:extra.surname,
        full_name:(extra.firstName + " " + extra.surname).trim(),
        username:extra.username,
        date_of_birth:extra.dateOfBirth || null,
        email:extra.email || null
    };

    if(extra.phone){
        payload.phone = extra.phone;
    }

    if(referredBy){
        payload.referred_by = referredBy;
    }

    const {error} = await supabaseClient
        .from("profiles")
        .upsert(payload,{onConflict:"id"});

    if(error) throw error;

    return referredBy;
}


/* =========================
   EMAIL SIGNUP
========================= */

document.getElementById("createEmail").addEventListener("click",async ()=>{

    const data = window.StudentXSignup.getData();

    if(!data.email){
        showMsg("Please enter your email.");
        return;
    }

    if(!data.password || !data.confirmPassword){
        showMsg("Please enter and confirm your password.");
        return;
    }

    if(data.password.length < 6){
        showMsg("Password must be at least 6 characters.");
        return;
    }

    if(data.password !== data.confirmPassword){
        showMsg("Passwords do not match.");
        return;
    }

    const btn = document.getElementById("createEmail");

    btn.disabled = true;
    btn.textContent = "Creating account...";

    try{

        const available = await usernameAvailable(data.username);

        if(!available){
            showMsg("Username already taken.");
            window.StudentXSignup.showStep("step3");
            return;
        }

        const redirectUrl =
            new URL("home.html",window.location.href).href;

        const {data:authData,error:authError} =
            await supabaseClient.auth.signUp({
                email:data.email,
                password:data.password,
                options:{
                    emailRedirectTo:redirectUrl,
                    data:{
                        first_name:data.firstName,
                        surname:data.surname,
                        full_name:
                            (data.firstName + " " + data.surname).trim(),
                        username:data.username,
                        date_of_birth:data.dateOfBirth
                    }
                }
            });

        if(authError){
            throw authError;
        }

        if(!authData.user){
            throw new Error("Could not create your account.");
        }

        await createProfile(authData.user,{
            firstName:data.firstName,
            surname:data.surname,
            username:data.username,
            dateOfBirth:data.dateOfBirth,
            email:data.email
        });

        showMsg(
            "We sent a verification email. Check your email."
        );

        setTimeout(()=>{
            window.location.href="login.html?verify=email";
        },1800);

    }catch(err){

        console.error(err);

        showMsg(
            err.message ||
            "Could not create your account."
        );

    }finally{

        btn.disabled = false;
        btn.textContent = "Create Account";
    }
});


/* =========================
   PHONE OTP
   (Uses Supabase's own phone auth end-to-end. Requires an SMS
   provider — e.g. Twilio — to be configured under Supabase
   Dashboard -> Authentication -> Providers -> Phone.
   The previous version of this file routed through a separate
   third-party "Modem" OTP API with a secret key hardcoded in
   this client-side file, which (a) exposed that key to anyone
   who viewed the page source, and (b) never actually completed
   Supabase's own phone verification, so phone signup never
   produced a real logged-in session. Both problems are fixed
   by using only supabaseClient.auth.signInWithOtp / verifyOtp.)
========================= */

let currentOtpPhone = null;


/* SEND OTP */

document.getElementById("sendOtp").addEventListener("click",async ()=>{

    const data = window.StudentXSignup.getData();

    const phone = normalizeNigeriaPhone(data.phone);

    if(!validNigeriaPhone(phone)){
        showMsg("Please enter a valid Nigerian phone number.");
        return;
    }

    const btn = document.getElementById("sendOtp");

    btn.disabled = true;
    btn.textContent = "Sending OTP...";

    try{

        const available =
            await usernameAvailable(data.username);

        if(!available){
            showMsg("Username already taken.");
            window.StudentXSignup.showStep("step3");
            return;
        }

        const {error} = await supabaseClient.auth.signInWithOtp({
            phone:phone,
            options:{
                shouldCreateUser:true,
                data:{
                    first_name:data.firstName,
                    surname:data.surname,
                    full_name:
                        (data.firstName + " " + data.surname).trim(),
                    username:data.username,
                    date_of_birth:data.dateOfBirth
                }
            }
        });

        if(error){
            throw error;
        }

        currentOtpPhone = phone;

        window.StudentXSignup.showOtp();

        showMsg("OTP sent successfully.");

        document.getElementById("otp").focus();

    }catch(err){

        console.error(err);

        showMsg(
            err.message ||
            "Could not send OTP. Make sure phone sign-in is enabled for this app."
        );

    }finally{

        btn.disabled = false;
        btn.textContent = "Send OTP";
    }
});


/* VERIFY OTP */

document.getElementById("verifyOtp").addEventListener("click",async ()=>{

    const data = window.StudentXSignup.getData();

    const otp = String(data.otp || "").trim();

    if(!currentOtpPhone){
        showMsg("Please request a new OTP.");
        return;
    }

    if(!/^\d{6}$/.test(otp)){
        showMsg("Enter the 6-digit OTP.");
        return;
    }

    const btn = document.getElementById("verifyOtp");

    btn.disabled = true;
    btn.textContent = "Verifying...";

    try{

        const {data:authData,error:authError} =
            await supabaseClient.auth.verifyOtp({
                phone:currentOtpPhone,
                token:otp,
                type:"sms"
            });

        if(authError){
            throw authError;
        }

        if(!authData.user){
            throw new Error("Verification succeeded but no account was returned. Please try again.");
        }

        await createProfile(authData.user,{
            firstName:data.firstName,
            surname:data.surname,
            username:data.username,
            dateOfBirth:data.dateOfBirth,
            phone:currentOtpPhone
        });

        window.StudentXSignup.success();

    }catch(err){

        console.error(err);

        showMsg(
            err.message ||
            "Could not verify OTP."
        );

    }finally{

        btn.disabled = false;
        btn.textContent = "Verify & Create Account";
    }
});
