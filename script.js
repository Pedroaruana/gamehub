function getSupabase() {
  return window.supabaseClient;
}

// usa o cliente já existente
const sb = window.supabaseClient;

async function testar() {
  const { data, error } = await sb
    .from("usuarios")
    .select("*");

  console.log(data, error);
}

testar();

function criarCard(jogo, index) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <img src="${jogo.thumbnail}">

    <div class="card-overlay">
      <h3 class="game-title">${jogo.title}</h3>

      <div class="price-box">
        ${jogo.oldPrice ? `<span class="old-price">R$ ${jogo.oldPrice}</span>` : ""}
        ${jogo.price ? `<span class="new-price">R$ ${jogo.price}</span>` : ""}

        <span class="cart">🛒</span>
        <span class="fav">♡</span>
      </div>
    </div>
  `;

  const img = card.querySelector("img");
  const favBtn = card.querySelector(".fav");
  const cartBtn = card.querySelector(".cart");

  // 🔗 abrir detalhes
img.addEventListener("click", () => {

  localStorage.setItem(
    "jogoSelecionado",
    JSON.stringify(jogo)
  );

  window.location.href = "detalhes.html";

});

  // ❤️ favorito
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    favoritar(e, jogo.title, favBtn);
    carregarFavoritosMenu();
  });

  // 🛒 carrinho (AGORA CORRETO)
  cartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    adicionarCarrinho(jogo);
  });

  return card;
}

/* =========================
   CARREGAR JOGOS
========================= */

function carregarJogos() {
  const populares = document.getElementById("populares");
  const acao = document.getElementById("acao");
  const rpg = document.getElementById("rpg");

  if (populares) populares.innerHTML = "";
  if (acao) acao.innerHTML = "";
  if (rpg) rpg.innerHTML = "";

  jogos.forEach((jogo, index) => {
    const card = criarCard(jogo, index);

    populares?.appendChild(card);

    if (jogo.category === "acao") {
      acao?.appendChild(criarCard(jogo, index));
    }

   
  });
}

/* =========================
   FAVORITOS
========================= */

async function favoritar(e, nome, el) {

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) {
    alert("Faça login para favoritar jogos.");
    return;
  }

  const favoritoAtivo = el.classList.contains("ativo");

  if (favoritoAtivo) {

    const { error } = await window.supabaseClient
      .from("favoritos")
      .delete()
      .eq("user_id", user.id)
      .eq("jogo", nome);

    console.log("DELETE:", error);

    el.classList.remove("ativo");

  } else {

    console.log("USER:", user.id);
console.log("JOGO:", nome);


    const { error } = await window.supabaseClient
      .from("favoritos")
      .insert({
        user_id: user.id,
        jogo: nome
      });

    console.log("INSERT:", error);

    el.classList.add("ativo");
  }

  carregarFavoritosMenu();
}
/* =========================
   CARRINHO
========================= */

// ➕ adicionar
async function adicionarCarrinho(jogo) {

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) {
    alert("Faça login para usar o carrinho.");
    return;
  }

  await window.supabaseClient
    .from("carrinho")
    .insert({
      user_id: user.id,
      title: jogo.title,
      thumbnail: jogo.thumbnail,
      price: Number(jogo.price)
    });

  atualizarCarrinho();
  animarCarrinho();
}

// ❌ remover
async function removerItem(id, e) {

  if (e) e.stopPropagation();

  const { error } = await window.supabaseClient
    .from("carrinho")
    .delete()
    .eq("id", id);

  console.log("REMOVER:", error);

  atualizarCarrinho();
}

async function atualizarCarrinho() {

  const container = document.querySelector(".cart-content");
  const totalEl = document.getElementById("cartTotal");
  const count = document.getElementById("cartCount");

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) {
    count.innerText = "0";
    totalEl.innerText = "R$ 0,00";
    container.innerHTML =
      "<p style='text-align:center'>Faça login</p>";
    return;
  }

  const { data: carrinho, error } =
    await window.supabaseClient
      .from("carrinho")
      .select("*")
      .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  count.innerText = carrinho.length;

  if (carrinho.length === 0) {
    container.innerHTML =
      "<p style='text-align:center'>Carrinho vazio</p>";

    totalEl.innerText = "R$ 0,00";
    return;
  }




  container.innerHTML = "";

  let total = 0;

  carrinho.forEach((item) => {

    const preco = Number(item.price) || 0;

    total += preco;

    container.innerHTML += `
      <div class="cart-item">

        <img src="${item.thumbnail}">

        <div class="cart-info">
          <p>${item.title}</p>
        </div>

        <div class="cart-price">
          R$ ${preco.toFixed(2)}
        </div>

        <span
          class="remove-item"
          onclick="removerItem(${item.id}, event)"
        >
          ✖
        </span>

      </div>
    `;
  });

  totalEl.innerText =
    "R$ " + total.toFixed(2).replace(".", ",");
}


  


// 🎯 animação
function animarCarrinho() {
  const cart = document.getElementById("cartHeader");

  if (!cart) return;

  cart.classList.add("bounce");

  setTimeout(() => {
    cart.classList.remove("bounce");
  }, 400);
}

/* =========================
   OUTROS
========================= */

function carregarHero() {
  const hero = document.getElementById("hero");

  if (!hero) return; // 🔥 impede crash

  hero.style.backgroundImage = "url('./banner.jpg')";
}

/* =========================
   CARRINHO CLICK (SEM HOVER)
========================= */

const cartHeader = document.getElementById("cartHeader");
const cartDropdown = document.getElementById("cartDropdown");

if (cartHeader && cartDropdown) {
  cartHeader.addEventListener("click", () => {
    cartDropdown.classList.toggle("active");
  });
}

/* =========================
   CLICK GLOBAL (MAIS VENDIDOS)
========================= */

document.addEventListener("click", (e) => {

  // 🛒 CARRINHO
  const cart = e.target.closest(".cart-btn, .cart");
  if (cart) {
    e.stopPropagation();

    const card = cart.closest(".vendido-card") || cart.closest(".card");
    if (!card) return;

    const jogo = {
      title: card.querySelector("h3")?.innerText || "Jogo",
      price: card.querySelector(".new-price")?.innerText.replace("R$", "").trim() || "0",
      thumbnail: card.querySelector("img")?.src || ""
    };

    adicionarCarrinho(jogo);
  }

  // ❤️ FAVORITO
  const fav = e.target.closest(".fav-btn, .fav");
  if (fav) {
    e.stopPropagation();
    fav.classList.toggle("ativo");
  }

});

async function carregarApiGames() {

  const container = document.getElementById("api-games");

  if (!container) return;

  try {

    const response = await fetch(
      "https://www.freetogame.com/api/games"
    );

    const games = await response.json();

    container.innerHTML = "";

    games.slice(0, 20).forEach((game, index) => {

      const precoOriginal = Math.floor(Math.random() * 150) + 50;
const desconto = Math.floor(Math.random() * 70) + 10;

const precoFinal = (
  precoOriginal * (1 - desconto / 100)
).toFixed(2);

const jogo = {
  title: game.title,
  thumbnail: game.thumbnail,
  oldPrice: precoOriginal.toFixed(2),
  price: precoFinal
};

      container.appendChild(
        criarCard(jogo, index)
      );

    });

  } catch (error) {

    console.error("Erro ao carregar API:", error);

  }

}

/* =========================
   INIT
========================= */



const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (searchInput && searchResults) {

  searchInput.addEventListener("input", () => {

    const termo = searchInput.value.toLowerCase().trim();

    if (!termo) {
      searchResults.style.display = "none";
      searchResults.innerHTML = "";
      return;
    }

    const encontrados = jogos.filter(jogo =>
      jogo.title.toLowerCase().includes(termo)
    );

    searchResults.style.display = "block";

    if (encontrados.length === 0) {
      searchResults.innerHTML = `
        <div class="search-item">
          Nenhum jogo encontrado
        </div>
      `;
      return;
    }

    searchResults.innerHTML = encontrados
  .map((jogo, index) => {

    window.tempJogo = window.tempJogo || [];
    window.tempJogo[index] = jogo;

    return `
      <div class="search-item" onclick="abrirJogo(window.tempJogo[${index}])">

        <img src="${jogo.thumbnail}">

        <div class="search-info">
          <h4>${jogo.title}</h4>
          <span>R$ ${jogo.price}</span>
        </div>

      </div>
    `;
  })
  .join("");

  });

}

document.addEventListener("click", (e) => {

  if (
    !searchInput.contains(e.target) &&
    !searchResults.contains(e.target)
  ) {
    searchResults.style.display = "none";
  }

});

window.addEventListener("DOMContentLoaded", () => {
  carregarJogos();
  carregarApiGames();
  carregarHero();
  carregarFavoritos();
  carregarFavoritosMenu();

  atualizarAuthUI();
});

async function mostrarUsuario() {
  const { data } = await getSupabase().auth.getUser();

  if (data?.user) {
    console.log("Logado como:", data.user.email);
  }
}

async function logout() {
  await getSupabase().auth.signOut();
  window.location.href = "login.html";
}

async function protegerPagina() {
  const supabase = window.supabaseClient;
  if (!supabase) return;

  const { data, error } = await supabase.auth.getSession();

  if (!data?.session) return; // 👈 NÃO REDIRECIONA MAIS AUTOMATICAMENTE
}

async function verificarLogin() {
  const { data: { user } } = await getSupabase().auth.getUser();

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await getSupabase().auth.signOut();
    window.location.reload();
  });
}


async function atualizarUIUsuario() {
  const supabase = window.supabaseClient;

  if (!supabase) return; // 🔥 evita crash

  const { data: { user } } = await supabase.auth.getUser();

  const logoutBtn = document.getElementById("logoutBtn");
  const loginBtn = document.querySelector(".login");

  if (!logoutBtn || !loginBtn) return;

  if (user) {
    logoutBtn.style.display = "block";
    loginBtn.style.display = "none";
  } else {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
  }
}
window.addEventListener("DOMContentLoaded", async () => {

  atualizarCarrinho();
  carregarJogos();
  carregarApiGames();
  carregarHero();
  carregarFavoritos();

  const supabase = window.supabaseClient;
  if (!supabase) return;

  await protegerPagina();
  await verificarLogin();
  await atualizarUIUsuario();
});

async function atualizarAuthUI() {
  const supabase = getSupabase();

  if (!supabase) return; // 🔥 EVITA QUEBRAR TUDO

  const { data: { user } } = await supabase.auth.getUser();

  const logoutBtn = document.getElementById("logoutBtn");
  const loginBtn = document.querySelector(".login");

  if (!logoutBtn || !loginBtn) return;

  if (user) {
    logoutBtn.style.display = "block";
    loginBtn.style.display = "none";
  } else {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabaseClient;
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();

  const logoutBtn = document.getElementById("logoutBtn");
  const loginBtn = document.querySelector(".login");

  if (!logoutBtn || !loginBtn) return;

  if (user) {
    logoutBtn.style.display = "block";
    loginBtn.style.display = "none";
  } else {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
  }
});

function atualizarAuth() {
  const supabase = window.supabaseClient;
  if (!supabase) return;

  supabase.auth.getUser().then(({ data: { user } }) => {
    const logoutBtn = document.getElementById("logoutBtn");
    const loginBtn = document.querySelector(".login");

    if (!logoutBtn || !loginBtn) return;

    if (user) {
      logoutBtn.style.display = "block";
      loginBtn.style.display = "none";
    } else {
      logoutBtn.style.display = "none";
      loginBtn.style.display = "block";
    }
  });
}

// 🔥 ISSO É O QUE ESTAVA FALTANDO
window.addEventListener("DOMContentLoaded", () => {
  atualizarAuth();

  window.supabaseClient.auth.onAuthStateChange(() => {
    atualizarAuth();
  });
});

async function carregarFavoritos() {

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) return;

  const { data } = await window.supabaseClient
    .from("favoritos")
    .select("*")
    .eq("user_id", user.id);

  const favoritos = data.map(f => f.jogo);

  document.querySelectorAll(".card").forEach(card => {

    const nome =
      card.querySelector(".game-title")?.innerText;

    const fav =
      card.querySelector(".fav");

    if (
      favoritos.includes(nome)
      && fav
    ) {
      fav.classList.add("ativo");
    }
  });

}

async function carregarFavoritosMenu() {
  const menu = document.getElementById("favoritosMenu");

  if (!menu) return;

  const {
    data: { user }
  } = await window.supabaseClient.auth.getUser();

  if (!user) {
    menu.innerHTML = "<span>Faça login</span>";
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("favoritos")
    .select("jogo")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    menu.innerHTML = "<span>Nenhum favorito</span>";
    return;
  }

  menu.innerHTML = data
    .map(item => `<a href="#">${item.jogo}</a>`)
    .join("");
}
carregarFavoritosMenu();

function iniciarContagem() {

  const countdowns =
    document.querySelectorAll(".countdown");

  const dataFinal =
    new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

  setInterval(() => {

    const agora = new Date().getTime();

    const distancia = dataFinal - agora;

    const dias =
      Math.floor(distancia / (1000 * 60 * 60 * 24));

    const horas =
      Math.floor(
        (distancia % (1000 * 60 * 60 * 24))
        / (1000 * 60 * 60)
      );

    const minutos =
      Math.floor(
        (distancia % (1000 * 60 * 60))
        / (1000 * 60)
      );

    const segundos =
      Math.floor(
        (distancia % (1000 * 60))
        / 1000
      );

    countdowns.forEach(el => {
      el.innerText =
        `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    });

  }, 1000);
}

window.addEventListener(
  "DOMContentLoaded",
  iniciarContagem
);
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
} 

window.adicionarCarrinho = async function (jogo) {

  const { data: { user } } =
    await window.supabaseClient.auth.getUser();

  if (!user) {
    alert("Faça login primeiro");
    return;
  }

  if (!jogo) {
    jogo = JSON.parse(localStorage.getItem("jogoSelecionado"));
  }

  if (!jogo) return;

  await window.supabaseClient.from("carrinho").insert([
    {
      user_id: user.id,
      title: jogo.title,
      price: jogo.price,
      thumbnail: jogo.thumbnail
    }
  ]);

  // 🔥 FORÇA atualização imediata da UI
  await carregarCarrinhoUI();
};

window.abrirChat = function () {
  const chat = document.getElementById("chatBox");
  if (chat) chat.style.display = "block";
};

window.fecharChat = function () {
  const chat = document.getElementById("chatBox");
  if (chat) chat.style.display = "none";
};
async function carregarCarrinhoUI() {

  const { data: { user } } =
    await window.supabaseClient.auth.getUser();

  if (!user) return;

  const { data } = await window.supabaseClient
    .from("carrinho")
    .select("*")
    .eq("user_id", user.id);

  const container = document.querySelector(".cart-content");

  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="empty">Carrinho vazio</p>`;
    return;
  }
document.getElementById("cartCount").innerText = data.length;
  container.innerHTML = data.map(item => `
    <div class="cart-item">
      <img src="${item.thumbnail}" width="40">
      <div>
        <p>${item.title}</p>
        <small>R$ ${item.price}</small>
      </div>
    </div>
  `).join("");
}

window.irParaCheckout = function () {
  window.location.href = "checkout.html";
};

window.abrirJogo = function (jogo) {
  localStorage.setItem("jogoSelecionado", JSON.stringify(jogo));
  window.location.href = "detalhes.html";
};