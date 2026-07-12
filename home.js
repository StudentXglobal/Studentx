document.addEventListener("DOMContentLoaded", async () => {

  // Duba ko user ya login
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Karanta profile daga database
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  // Full Name
  const fullName = document.getElementById("fullName");
  if (fullName) {
    fullName.textContent = data.full_name;
  }

  // Username
  const username = document.getElementById("username");
  if (username) {
    username.textContent = "@" + data.username;
  }

  // University
  const university = document.getElementById("university");
  if (university) {
    university.textContent = data.university;
  }

  // Avatar
  const avatar = document.getElementById("profileAvatar");
  if (avatar && data.avatar_url) {
    avatar.src = data.avatar_url;
  }

});
