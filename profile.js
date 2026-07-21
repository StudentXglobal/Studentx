function openMenu() {
    document.getElementById("bottomMenu").style.display = "block";
}

window.addEventListener("click", function (e) {
    const menu = document.getElementById("bottomMenu");

    if (e.target === menu) {
        menu.style.display = "none";
    }
});

function editProfile() {
    alert("Edit Profile - Coming Soon");
}

function changeProfilePhoto() {
    alert("Change Profile Picture - Coming Soon");
}

function changeCoverPhoto() {
    alert("Change Cover Photo - Coming Soon");
}

function editBio() {
    alert("Edit Bio - Coming Soon");
}

function openPrivacy() {
    alert("Privacy - Coming Soon");
}

function requestVerification() {
    alert("Verification Request - Coming Soon");
}

function openPremium() {
    alert("StudentX Premium - Coming Soon");
}

function openSettings() {
    alert("Settings - Coming Soon");
}
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

    if (!profile) {
        alert("Profile not found");
        return;
    }

    document.getElementById("fullName").textContent =
        profile.full_name || "StudentX User";

    document.getElementById("username").textContent =
        "@" + (profile.username || "student");

    document.getElementById("bio").textContent =
        profile.bio || "No bio yet.";

    if (profile.avatar_url) {
        document.getElementById("profileAvatar").src =
            profile.avatar_url;
    }

    if (profile.cover_url) {
        document.getElementById("coverPhoto").src =
            profile.cover_url;
    }

    openMenu = function () {
        document.getElementById("bottomMenu").style.display = "block";
    }

    window.addEventListener("click", function (e) {
        const menu = document.getElementById("bottomMenu");
        if (e.target === menu) {
            menu.style.display = "none";
        }
    });

});

function editProfile() {
    alert("Edit Profile - Coming Soon");
}

function changeProfilePhoto() {
    alert("Change Profile Picture - Coming Soon");
}

function changeCoverPhoto() {
    alert("Change Cover Photo - Coming Soon");
}

function editBio() {
    alert("Edit Bio - Coming Soon");
}

function openPrivacy() {
    alert("Privacy - Coming Soon");
}

function requestVerification() {
    alert("Verification Request - Coming Soon");
}

function openPremium() {
    alert("StudentX Premium - Coming Soon");
}

function openSettings() {
    alert("Settings - Coming Soon");
}
