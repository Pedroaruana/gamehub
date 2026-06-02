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
      showToast("Preencha e-mail e senha.", "warning");
      return;
    }

    btnLogin.disabled = true;
    const textoOriginal = btnLogin.textContent;
    btnLogin.textContent = "Aguarde...";

    try {
      if (modo === "login") {

        const { error } = await window.supabaseClient.auth.signInWithPassword({
          email: email.value,
          password: password.value
        });

        if (error) {
          showToast("E-mail ou senha incorretos.", "error");
          return;
        }

        window.location.href = "index.html";

      } else {

        const { error } = await window.supabaseClient.auth.signUp({
          email: email.value,
          password: password.value
        });

        if (error) {
          if (error.message.includes("rate limit") || error.message.includes("email rate")) {
            showToast("Muitos cadastros em pouco tempo. Aguarde alguns minutos.", "warning");
          } else {
            showToast("Erro ao criar conta. Tente novamente.", "error");
          }
          return;
        }

        const successScreen = document.getElementById("successScreen");
        if (successScreen) successScreen.style.display = "flex";
        tabLogin.click();
      }
    } catch (e) {
      showToast("Erro de conexão. Tente novamente.", "error");
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = textoOriginal;
    }

  });

});
