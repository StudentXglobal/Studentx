document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        alert("User not logged in");
        window.location.href = "login.html";
        return;
    }

    alert("User ID:\n" + user.id);

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        alert(profileError.message);
        return;
    }

    if (!profile) {
        alert("Profile not found");
        return;
    }
alert(JSON.stringify(profile));
    
    alert("Profile found!");

    document.getElementById("fullName").textContent = profile.full_name;
    document.getElementById("username").textContent = "@" + profile.username;
alert("Name: " + profile.full_name);
alert("Username: " + profile.username);
    if (profile.avatar_url) {
        document.getElementById("profileAvatar").src = profile.avatar_url;
    }

});
