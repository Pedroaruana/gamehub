window.addEventListener("DOMContentLoaded", async () => {

  const supabase = window.supabaseClient;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const actions = document.querySelector(".actions");

  if (user) {

    const nome = user.email.split("@")[0];

    const loginBtn = document.querySelector(".login");

    if (loginBtn) {
      loginBtn.remove();
    }

    actions.insertAdjacentHTML(
      "beforeend",
      `
      <div class="user-box">
        <div>Olá, <strong>${nome}</strong></div>
        <a href="#" id="logoutLink">
          Não é você? Sair
        </a>
      </div>
      `
    );

    document
      .getElementById("logoutLink")
      .addEventListener("click", async (e) => {

        e.preventDefault();

        await supabase.auth.signOut();

        window.location.reload();
      });
  }

});