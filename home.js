document.addEventListener("DOMContentLoaded", async () => {
  // Duba ko user ya login
  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return;
  }

  // Karanta profile daga database
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    alert(profileError.message);
    console.error(profileError);
    return;
  }

  // Full Name
  document.getElementById("fullName").textContent =
    profile.full_name || "StudentX User";

  // Username
  document.getElementById("username").textContent =
    "@" + (profile.username || "student");

  // Avatar
  if (profile.avatar_url) {
    document.getElementById("profileAvatar").src =
      profile.avatar_url;
  }
});
alert(JSON.stringify(profile));
