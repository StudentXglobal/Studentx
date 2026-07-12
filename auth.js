async function checkLogin() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
    return;
  }
}

checkLogin();
