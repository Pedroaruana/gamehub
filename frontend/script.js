/* ===========================================
   GAMEHUB — script.js
   Requerimentos: supabaseClient.js, jogos.js
=========================================== */

/* ── Helpers ─────────────────────────────── */

function getSupabase() {
  return window.supabaseClient;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let _tempBusca = [];

/* ── Sidebar ─────────────────────────────── */

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
}

/* ── Hero background ─────────────────────── */

function carregarHero() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  hero.style.backgroundImage = "url('./banner.jpg')";
}

/* ── Criar card de jogo ──────────────────── */

function criarCard(jogo) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <img src="${escapeHtml(jogo.thumbnail)}" alt="${escapeHtml(jogo.title)}" loading="lazy">
    <div class="card-overlay">
      <h3 class="game-title">${escapeHtml(jogo.title)}</h3>
      <div class="price-box">
        ${jogo.oldPrice ? `<span class="old-price">R$ ${escapeHtml(String(jogo.oldPrice))}</span>` : ""}
        ${jogo.price    ? `<span class="new-price">R$ ${escapeHtml(String(jogo.price))}</span>`    : ""}
        <span class="cart" title="Adicionar ao carrinho">🛒</span>
        <span class="fav"  title="Favoritar">♡</span>
      </div>
    </div>
  `;

  const img    = card.querySelector("img");
  const favBtn = card.querySelector(".fav");
  const cartBtn = card.querySelector(".cart");

  // Abrir detalhes
  img.addEventListener("click", () => abrirJogo(jogo));

  // Favoritar
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    favoritar(e, jogo.title, favBtn);
  });

  // Carrinho
  cartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    adicionarCarrinho(jogo);
  });

  return card;
}

/* ── Carregar prateleiras ────────────────── */

function carregarJogos() {
  const populares = document.getElementById("populares");
  const acao      = document.getElementById("acao");

  if (typeof jogos === "undefined") return;

  jogos.forEach((jogo) => {
    if (populares) populares.appendChild(criarCard(jogo));

    if (jogo.category === "acao" && acao) {
      acao.appendChild(criarCard(jogo));
    }
  });
}

/* ── API pública (Free-to-Game) ──────────── */

async function carregarApiGames() {
  const container = document.getElementById("api-games");
  if (!container) return;

  try {
    const response = await fetch("https://www.freetogame.com/api/games");
    if (!response.ok) throw new Error("Falha na API");

    const games = await response.json();
    container.innerHTML = "";

    games.slice(0, 20).forEach((game, index) => {
      // Preços fictícios para demo — jogos gratuitos da API não têm preço real
      const precoOriginal = Math.floor(Math.random() * 150) + 50;
      const desconto      = Math.floor(Math.random() * 70)  + 10;
      const precoFinal    = (precoOriginal * (1 - desconto / 100)).toFixed(2);

      const jogo = {
        title:    game.title,
        thumbnail: game.thumbnail,
        oldPrice: precoOriginal.toFixed(2),
        price:    precoFinal
      };

      container.appendChild(criarCard(jogo));
    });
  } catch (err) {
    console.warn("Erro ao carregar API de jogos:", err.message);
  }
}

/* ── Favoritos ───────────────────────────── */

async function favoritar(e, nome, el) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    showToast("Faça login para favoritar jogos.", "warning");
    return;
  }

  if (el.classList.contains("ativo")) {
    // remover
    await sb.from("favoritos")
      .delete()
      .eq("user_id", user.id)
      .eq("jogo", nome);

    el.classList.remove("ativo");
    el.textContent = "♡";
  } else {
    // inserir
    await sb.from("favoritos")
      .insert({ user_id: user.id, jogo: nome });

    el.classList.add("ativo");
    el.textContent = "❤️";
  }

  carregarFavoritosMenu();
}

async function carregarFavoritos() {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  const { data } = await sb.from("favoritos")
    .select("jogo")
    .eq("user_id", user.id);

  if (!data) return;

  const favoritosSet = new Set(data.map(f => f.jogo));

  document.querySelectorAll(".card").forEach(card => {
    const nome   = card.querySelector(".game-title")?.textContent;
    const favEl  = card.querySelector(".fav");
    if (nome && favoritosSet.has(nome) && favEl) {
      favEl.classList.add("ativo");
      favEl.textContent = "❤️";
    }
  });
}

async function carregarFavoritosMenu() {
  const menu = document.getElementById("favoritosMenu");
  if (!menu) return;

  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    menu.innerHTML = "<span>Faça login</span>";
    return;
  }

  const { data, error } = await sb.from("favoritos")
    .select("jogo")
    .eq("user_id", user.id);

  if (error) { console.error("Favoritos menu:", error); return; }

  if (!data || data.length === 0) {
    menu.innerHTML = "<span>Nenhum favorito</span>";
    return;
  }

  menu.innerHTML = data.map(item =>
    `<a href="#" class="fav-link" data-nome="${escapeHtml(item.jogo)}">${escapeHtml(item.jogo)}</a>`
  ).join("");

  menu.querySelectorAll(".fav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const nome = link.dataset.nome;
      const jogo = (window.jogos || []).find(j => j.title === nome);
      if (jogo) {
        abrirJogo(jogo);
      } else {
        localStorage.setItem("jogoSelecionado", JSON.stringify({ title: nome, thumbnail: "", price: "" }));
        window.location.href = "detalhes.html";
      }
    });
  });
}

/* ── Carrinho ────────────────────────────── */

async function adicionarCarrinho(jogo) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    showToast("Faça login para usar o carrinho.", "warning");
    return;
  }

  const { error } = await sb.from("carrinho").insert({
    user_id:   user.id,
    title:     jogo.title,
    thumbnail: jogo.thumbnail,
    price:     Number(jogo.price) || 0
  });

  if (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    return;
  }

  animarCarrinho();
  await atualizarCarrinho();
}

async function removerItem(id, e) {
  if (e) e.stopPropagation();

  const sb = getSupabase();
  await sb.from("carrinho").delete().eq("id", id);
  await atualizarCarrinho();
}

async function atualizarCarrinho() {
  const container = document.querySelector(".cart-content");
  const totalEl   = document.getElementById("cartTotal");
  const countEl   = document.getElementById("cartCount");

  if (!container || !totalEl || !countEl) return;

  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    countEl.textContent = "0";
    totalEl.textContent = "R$ 0,00";
    container.innerHTML = "<p style='text-align:center;color:#aaa'>Faça login</p>";
    return;
  }

  const { data: carrinho, error } = await sb.from("carrinho")
    .select("*")
    .eq("user_id", user.id);

  if (error) { console.error("Carrinho:", error); return; }

  countEl.textContent = carrinho.length;

  if (carrinho.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:#aaa'>Carrinho vazio</p>";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  let total = 0;
  container.innerHTML = carrinho.map(item => {
    const preco = Number(item.price) || 0;
    total += preco;
    return `
      <div class="cart-item">
        <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}">
        <div class="cart-info">
          <p>${escapeHtml(item.title)}</p>
          <span class="cart-price">R$ ${preco.toFixed(2).replace(".", ",")}</span>
        </div>
        <span class="remove-item" onclick="removerItem(${Number(item.id)}, event)" title="Remover">✖</span>
      </div>
    `;
  }).join("");

  totalEl.textContent = "R$ " + total.toFixed(2).replace(".", ",");
}

function animarCarrinho() {
  const cart = document.getElementById("cartHeader");
  if (!cart) return;
  cart.classList.remove("bounce");
  // force reflow para reiniciar animação
  void cart.offsetWidth;
  cart.classList.add("bounce");
  setTimeout(() => cart.classList.remove("bounce"), 400);
}

/* ── Busca ───────────────────────────────── */

function inicializarBusca() {
  const searchInput   = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", () => {
    const termo = searchInput.value.toLowerCase().trim();

    if (!termo) {
      searchResults.style.display = "none";
      searchResults.innerHTML = "";
      return;
    }

    if (typeof jogos === "undefined") return;

    const encontrados = jogos.filter(j =>
      j.title.toLowerCase().includes(termo)
    );

    searchResults.style.display = "block";

    if (encontrados.length === 0) {
      searchResults.innerHTML = `
        <div class="search-item">Nenhum jogo encontrado</div>
      `;
      return;
    }

    _tempBusca = encontrados;

    searchResults.innerHTML = encontrados.map((jogo, i) => `
      <div class="search-item" data-busca-idx="${i}">
        <img src="${escapeHtml(jogo.thumbnail)}" alt="${escapeHtml(jogo.title)}">
        <div class="search-info">
          <h4>${escapeHtml(jogo.title)}</h4>
          <span>R$ ${escapeHtml(String(jogo.price))}</span>
        </div>
      </div>
    `).join("");

    // Delegação de evento nos resultados
    searchResults.querySelectorAll(".search-item[data-busca-idx]").forEach(el => {
      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.buscaIdx, 10);
        abrirJogo(_tempBusca[idx]);
      });
    });
  });

  // fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });
}

/* ── Contador regressivo ─────────────────── */

function iniciarContagem() {
  const countdowns = document.querySelectorAll(".countdown");
  if (!countdowns.length) return;

  const dataFinal = Date.now() + 7 * 24 * 60 * 60 * 1000;

  setInterval(() => {
    const diff = dataFinal - Date.now();
    if (diff <= 0) { countdowns.forEach(el => el.textContent = "Encerrado"); return; }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    countdowns.forEach(el => {
      el.textContent = `${d}d ${h}h ${m}m ${s}s`;
    });
  }, 1000);
}

/* ── Auth UI ─────────────────────────────── */

async function atualizarAuth() {
  const sb = getSupabase();
  if (!sb) return;

  const { data: { session } } = await sb.auth.getSession();
  const user = session?.user ?? null;

  const loginBtn  = document.querySelector(".login");
  const userBox   = document.getElementById("userBox");
  const userEmail = document.getElementById("userEmail");

  if (user) {
    const nome = user.email.split("@")[0];

    if (loginBtn) loginBtn.style.display = "none";

    if (userBox) {
      userBox.style.display = "flex";
      if (userEmail) userEmail.textContent = nome;
      const avatar = document.getElementById("userAvatar");
      if (avatar) avatar.textContent = nome.charAt(0).toUpperCase();
    } else if (loginBtn) {
      // páginas sem #userBox no HTML (ex: detalhes.html)
      const actions = loginBtn.closest(".actions") || loginBtn.parentElement;
      actions.insertAdjacentHTML("beforeend", `
        <div class="user-box" id="userBox" style="display:flex">
          <span id="userEmail">${nome}</span>
          <a href="#" id="logoutBtn">Sair</a>
        </div>
      `);
      document.getElementById("logoutBtn")
        .addEventListener("click", (e) => { e.preventDefault(); logout(); });
    }

  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (userBox)  userBox.style.display  = "none";
  }
}

async function logout() {
  const sb = getSupabase();
  try {
    await sb.auth.signOut();
  } catch (e) {
    console.error("Erro ao fazer logout:", e);
  }
  await atualizarAuth();
  await atualizarCarrinho();
  await carregarFavoritosMenu();
}

window.logout = logout;

/* ── Navegação ───────────────────────────── */

window.abrirJogo = function (jogo) {
  localStorage.setItem("jogoSelecionado", JSON.stringify(jogo));
  window.location.href = "detalhes.html";
};

window.irParaCheckout = function () {
  window.location.href = "checkout.html";
};

/* ── Chat flutuante ──────────────────────── */

window.abrirChat = function () {
  const chat = document.getElementById("chatBox");
  if (chat) chat.style.display = "block";
};

window.fecharChat = function () {
  const chat = document.getElementById("chatBox");
  if (chat) chat.style.display = "none";
};

/* ── Delegação de eventos globais ────────── */

document.addEventListener("click", (e) => {
  // Carrinho — cards "Mais Vendidos" (sem data-jogo vinculado)
  const cartEl = e.target.closest(".actions-vendido .cart");
  if (cartEl) {
    e.stopPropagation();
    const card  = cartEl.closest(".vendido-card");
    if (!card) return;
    const jogo = {
      title:     card.querySelector("h3")?.textContent   || "Jogo",
      price:     card.querySelector(".new-price")?.textContent.replace(/[^0-9,.]/g, "").replace(",", ".") || "0",
      thumbnail: card.querySelector("img")?.src || ""
    };
    adicionarCarrinho(jogo);
    return;
  }

  // Favorito — cards "Mais Vendidos"
  const favEl = e.target.closest(".actions-vendido .fav");
  if (favEl) {
    e.stopPropagation();
    const card = favEl.closest(".vendido-card");
    const nome = card?.querySelector("h3")?.textContent || "Jogo";
    favoritar(e, nome, favEl);
  }
});

/* ── Meus Pedidos ────────────────────────── */

async function carregarPedidos() {
  const container  = document.getElementById("ordersContent");
  const countBadge = document.getElementById("ordersCountBadge");
  if (!container) return;

  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    container.innerHTML = "<p style='color:#475569;text-align:center;padding:24px 0;font-size:13px'>Faça login para ver seus pedidos</p>";
    return;
  }

  const { data: pedidos, error } = await sb
    .from("pedidos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !pedidos || pedidos.length === 0) {
    container.innerHTML = "<p style='color:#475569;text-align:center;padding:24px 0;font-size:13px'>Nenhum pedido encontrado</p>";
    return;
  }

  if (countBadge) countBadge.textContent = pedidos.length + (pedidos.length === 1 ? " pedido" : " pedidos");

  const metodoLabel = {
    pix: "Pix", boleto: "Boleto", paypal: "PayPal",
    applepay: "Apple Pay", binance: "Binance Pay",
    cartao_parcelado: "Cartão Parcelado",
    cartao_avista_visa: "Visa", cartao_avista_master: "Mastercard",
    cartao_avista_elo: "Elo", cartao_avista_amex: "Amex"
  };

  container.innerHTML = pedidos.map(p => {
    const status  = p.status || "pendente";
    const metodo  = metodoLabel[p.metodo_pagamento] || (p.metodo_pagamento || "—").replace(/_/g, " ");
    const total   = "R$ " + Number(p.total).toFixed(2).replace(".", ",");
    const idCurto = String(p.id).slice(0, 8).toUpperCase();
    const data    = p.created_at
      ? new Date(p.created_at).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" })
      : "";
    return `
      <div class="order-card ${status}">
        <div class="order-card-left">
          <span class="order-card-id">#${idCurto}</span>
          <span class="order-card-total">${total}</span>
          <div class="order-card-meta">
            <span>${metodo}</span>
            ${data ? `<span>${data}</span>` : ""}
          </div>
        </div>
        <span class="order-card-status ${status}">${status}</span>
      </div>
    `;
  }).join("");
}

function inicializarOrdersDropdown() {
  const ordersHeader   = document.getElementById("ordersHeader");
  const ordersDropdown = document.getElementById("ordersDropdown");
  if (!ordersHeader || !ordersDropdown) return;

  ordersHeader.addEventListener("click", async (e) => {
    ordersDropdown.classList.toggle("active");
    if (ordersDropdown.classList.contains("active")) await carregarPedidos();
  });

  document.addEventListener("click", (e) => {
    if (!ordersHeader.contains(e.target)) ordersDropdown.classList.remove("active");
  });

  // Auto-abre se vier de sucesso.html?pedidos=1
  if (new URLSearchParams(window.location.search).get("pedidos") === "1") {
    ordersDropdown.classList.add("active");
    carregarPedidos();
  }
}

/* ── Dropdown do carrinho ────────────────── */

function inicializarCartDropdown() {
  const cartHeader   = document.getElementById("cartHeader");
  const cartDropdown = document.getElementById("cartDropdown");
  if (!cartHeader || !cartDropdown) return;

  cartHeader.addEventListener("click", (e) => {
    // Evita fechar ao clicar em botões internos
    if (e.target.closest(".remove-item") || e.target.closest(".finish-btn")) return;
    cartDropdown.classList.toggle("active");
  });

  // fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!cartHeader.contains(e.target)) {
      cartDropdown.classList.remove("active");
    }
  });
}

/* ── Init ────────────────────────────────── */

window.addEventListener("DOMContentLoaded", async () => {
  const sb = getSupabase();
  if (!sb) {
    console.error("supabaseClient não encontrado. Verifique supabaseClient.js.");
    return;
  }

  // UI que não depende de auth
  carregarHero();
  carregarJogos();
  carregarApiGames();
  inicializarBusca();
  iniciarContagem();
  inicializarCartDropdown();
  inicializarOrdersDropdown();

  // UI que depende de auth
  await atualizarAuth();
  await atualizarCarrinho();
  await carregarFavoritos();
  await carregarFavoritosMenu();

  // Reagir a mudanças de sessão (login/logout em outra aba etc.)
  sb.auth.onAuthStateChange(async (_event, _session) => {
    await atualizarAuth();
    await atualizarCarrinho();
    await carregarFavoritos();
    await carregarFavoritosMenu();
  });
});



/* ── Expõe funções usadas inline no HTML ─── */
window.removerItem    = removerItem;
window.toggleSidebar  = toggleSidebar;
window.adicionarCarrinho = adicionarCarrinho;