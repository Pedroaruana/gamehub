window.addEventListener("DOMContentLoaded", () => {

  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const btnLogin = document.getElementById("btnLogin");
  const tabCreate = document.getElementById("tabCreate");

  // LOGIN
  btnLogin.addEventListener("click", async () => {

    const { error } = await window.supabaseClient.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) {
      alert("Erro login: " + error.message);
      return;
    }

    alert("Login feito!");
    window.location.href = "index.html";
  });

  // CRIAR CONTA
  tabCreate.addEventListener("click", async () => {

    const { error } = await window.supabaseClient.auth.signUp({
      email: email.value,
      password: password.value
    });

    if (error) {
      alert("Erro cadastro: " + error.message);
      return;
    }

    alert("Conta criada! Agora faça login.");
  });

});