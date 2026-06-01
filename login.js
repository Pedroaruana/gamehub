window.addEventListener("DOMContentLoaded", () => {

  const email    = document.getElementById("email");
  const password = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const tabLogin  = document.getElementById("tabLogin");
  const tabCreate = document.getElementById("tabCreate");

  let modo = "login"; // "login" ou "cadastro"

  // TROCA DE ABA
  tabLogin.addEventListener("click", () => {
    modo = "login";
    tabLogin.classList.add("active");
    tabCreate.classList.remove("active");
    btnLogin.textContent = "Acessar conta";
  });

  tabCreate.addEventListener("click", () => {
    modo = "cadastro";
    tabCreate.classList.add("active");
    tabLogin.classList.remove("active");
    btnLogin.textContent = "Criar conta";
  });

  // AÇÃO PRINCIPAL
  btnLogin.addEventListener("click", async () => {

    if (!email.value || !password.value) {
      alert("Preencha e-mail e senha.");
      return;
    }

    if (modo === "login") {

      const { error } = await window.supabaseClient.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });

      if (error) {
        alert("Erro no login: " + error.message);
        return;
      }

      window.location.href = "index.html";

    } else {

      const { error } = await window.supabaseClient.auth.signUp({
        email: email.value,
        password: password.value
      });

      if (error) {
        alert("Erro ao criar conta: " + error.message);
        return;
      }

      const successScreen = document.getElementById("successScreen");
      if (successScreen) successScreen.style.display = "flex";
      tabLogin.click();
    }

  });

});
