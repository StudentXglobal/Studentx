document.addEventListener("DOMContentLoaded", async () => {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error: profileError } = await supabaseClient
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .maybeSingle();

    if (profileError) {
        alert(profileError.message);
        return;
    }

    document.getElementById("fullName").textContent =
        profile.full_name || "StudentX User";

    document.getElementById("username").textContent =
        "@" + (profile.username || "student");

    if (profile.avatar_url) {
        document.getElementById("profileAvatar").src =
            profile.avatar_url;
    }
});
