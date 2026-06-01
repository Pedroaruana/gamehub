window.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();

  const loginBtn = document.querySelector(".login");
  const userBox  = document.getElementById("userBox");

  if (user) {
    const nome = user.email.split("@")[0];

    if (loginBtn) loginBtn.style.display = "none";

    if (userBox) {
      userBox.style.display = "flex";
      const emailEl = document.getElementById("userEmail");
      if (emailEl) emailEl.textContent = nome;
    } else {
      const actions = document.querySelector(".actions");
      if (actions) {
        actions.insertAdjacentHTML("beforeend", `
          <div class="user-box" id="userBox" style="display:flex">
            <span>Olá, <strong>${nome}</strong></span>
            <a href="#" id="logoutLink">Sair</a>
          </div>
        `);
      }
    }

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.href = "index.html";
      });
    }

  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (userBox)  userBox.style.display = "none";
  }

});
