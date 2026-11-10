const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const seed = Array.from({ length: 21 }, (_, i) => ({
  id: "piece-" + (i + 1),
  name: "Handmade piece " + String(i + 1).padStart(2, "0"),
  category: ["tableware", "decor", "planters"][i % 3],
  description:
    "A one-of-a-kind piece from our supplied studio photo collection. Confirm dimensions, finish and availability with us.",
  image: "img/pottery_shop_" + (i + 1) + ".jpg",
  price: null,
  published: true,
}));
const get = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  },
  put = (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  money = (n) => "৳" + Number(n).toLocaleString("en-BD");
let products = get("ps_products", seed),
  cart = get("ps_cart", []),
  filter = "all";
function header() {
  let p = document.body.dataset.page;
  $("#site-header").innerHTML =
    '<header class="site-header"><a class="brand" href="index.html"><span class="brand-mark">মৃ</span><span>Pottery Shop</span></a><nav class="nav" id="main-nav"><a class="' +
    (p === "home" ? "active" : "") +
    '" href="index.html">Home</a><a class="' +
    (p === "shop" ? "active" : "") +
    '" href="shop.html">Shop</a><a class="' +
    (p === "story" ? "active" : "") +
    '" href="story.html">Our story</a><a class="' +
    (p === "wholesale" ? "active" : "") +
    '" href="wholesale.html">Wholesale</a></nav><div class="header-actions"><button class="cart-button" id="open-cart">Bag <span class="cart-count" id="cart-count">0</span></button><button class="menu-toggle" id="menu-toggle" aria-label="Open menu">☰</button></div></header>';
}
function footer() {
  $("#site-footer").innerHTML =
    '<footer class="site-footer"><div class="footer-top"><div><div class="footer-brand">Pottery Shop <span style="color:#d59a7b">✳</span></div><p>Thoughtful handmade pottery for everyday rituals. A little story shaped in clay.</p></div><div class="footer-links"><a href="shop.html">Shop</a><a href="story.html">Our story</a><a href="wholesale.html">Wholesale</a><a href="https://www.facebook.com/Potteryshop25" target="_blank" rel="noreferrer">Facebook ↗</a></div></div><div class="footer-bottom"><span>© ' +
    new Date().getFullYear() +
    " Pottery Shop. Made with care.</span><span>বাংলার মাটি, হাতের ছোঁয়া</span></div></footer>";
}
function shell() {
  header();
  footer();
  $("#ui-root").innerHTML =
    '<div class="cart-overlay" id="cart-overlay"><aside class="cart-panel"><div class="cart-head"><h2>Your bag</h2><button class="close-cart" id="close-cart">×</button></div><div class="cart-items" id="cart-items"></div><div id="cart-summary"></div></aside></div><div class="cursor-dot"></div><div class="cursor-ring"></div>';
  $("#open-cart").onclick = () => {
    $("#cart-overlay").classList.add("open");
    drawCart();
  };
  $("#close-cart").onclick = () => $("#cart-overlay").classList.remove("open");
  $("#cart-overlay").onclick = (e) => {
    if (e.target.id === "cart-overlay")
      e.currentTarget.classList.remove("open");
  };
  $("#menu-toggle").onclick = () => $("#main-nav").classList.toggle("open");
  syncCart();
  cursor();
}
function card(p) {
  return (
    '<article class="product-card"><div class="product-image"><img src="' +
    esc(p.image) +
    '" alt="' +
    esc(p.name) +
    '" loading="lazy"><span class="product-tag">' +
    esc(p.category) +
    '</span><span class="product-price-tag">' +
    (p.price ? money(p.price) : "Price TBA") +
    '</span></div><div class="product-info"><div><h3>' +
    esc(p.name) +
    "</h3><p>" +
    esc(p.description.slice(0, 72)) +
    '…</p><button class="product-cta" data-add="' +
    p.id +
    '">Add to bag →</button> <button class="product-cta" data-enquire="' +
    p.id +
    '">Ask a question</button></div></div></article>"
  );
}
function render(target, cat = "all", q = "") {
  if (!target) return;
  let a = products.filter(
    (p) =>
      p.published &&
      (cat === "all" || p.category === cat) &&
      (p.name + " " + p.description).toLowerCase().includes(q.toLowerCase()),
  );
  target.innerHTML = a.length
    ? a.map(card).join("")
    : '<div class="empty-state">No pieces found. Try another search.</div>';
  $$("[data-add]", target).forEach(
    (b) =>
      (b.onclick = () => {
        let id = b.dataset.add,
          x = cart.find((z) => z.id === id);
        if (x) x.qty++;
        else cart.push({ id, qty: 1 });
        syncCart();
        b.textContent = "Added ✓";
        setTimeout(() => (b.textContent = "Add to bag →"), 1000);
      }),
  );
  $$("[data-enquire]", target).forEach(
    (b) =>
      (b.onclick = () => {
        let p = products.find((x) => x.id === b.dataset.enquire);
        location.href = "wholesale.html?piece=" + encodeURIComponent(p.name);
      }),
  );
}
function syncCart() {
  put("ps_cart", cart);
  let e = $("#cart-count");
  if (e) e.textContent = cart.reduce((n, x) => n + x.qty, 0);
}
function drawCart() {
  let box = $("#cart-items"),
    sum = $("#cart-summary");
  if (!box) return;
  box.innerHTML =
    cart
      .map((x) => {
        let p = products.find((z) => z.id === x.id);
        return p
          ? '<div class="cart-item"><img src="' +
              p.image +
              '" alt=""><div><strong>' +
              esc(p.name) +
              "</strong><small>" +
              (p.price ? money(p.price) : "Price to be confirmed") +
              '</small><div class="qty-controls"><button data-q="' +
              p.id +
              '" data-s="-1">−</button>' +
              x.qty +
              '<button data-q="' +
              p.id +
              '" data-s="1">+</button></div></div><button class="small-btn" data-r="' +
              p.id +
              '">Remove</button></div>'
          : "";
      })
      .join("") ||
    '<div class="empty-state">Your bag is waiting for something lovely.</div>';
  let quote = cart.some((x) => !products.find((p) => p.id === x.id)?.price),
    total = cart.reduce(
      (n, x) => n + (products.find((p) => p.id === x.id)?.price || 0) * x.qty,
      0,
    );
  sum.innerHTML = cart.length
    ? '<div class="cart-total"><span>Subtotal</span><span>' +
      (quote ? "To be confirmed" : money(total)) +
      '</span></div><a class="btn btn-dark" style="width:100%" href="checkout.html">Continue to order request →</a>'
    : "";
  $$("[data-q]").forEach(
    (b) =>
      (b.onclick = () => {
        let x = cart.find((z) => z.id === b.dataset.q);
        x.qty += Number(b.dataset.s);
        cart = cart.filter((z) => z.qty > 0);
        syncCart();
        drawCart();
      }),
  );
  $$("[data-r]").forEach(
    (b) =>
      (b.onclick = () => {
        cart = cart.filter((z) => z.id !== b.dataset.r);
        syncCart();
        drawCart();
      }),
  );
}
function shop() {
  render($("#shop-products"));
  $("#product-search")?.addEventListener("input", (e) =>
    render($("#shop-products"), filter, e.target.value),
  );
  $$("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        $$(".filter").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        filter = b.dataset.filter;
        render($("#shop-products"), filter, $("#product-search").value);
      }),
  );
}
function wholesale() {
  let f = $("#wholesale-form");
  if (!f) return;
  let piece = new URLSearchParams(location.search).get("piece");
  if (piece)
    f.elements.message.value =
      "I would like to enquire about: " + piece + "\n\n";
  f.onsubmit = (e) => {
    e.preventDefault();
    let a = get("ps_enquiries", []);
    a.unshift({
      ...Object.fromEntries(new FormData(f)),
      id: Date.now(),
      date: new Date().toISOString(),
    });
    put("ps_enquiries", a);
    f.reset();
    $("#wholesale-feedback").textContent =
      "Thank you. Your enquiry has been saved in this browser demo.";
  };
}
function checkout() {
  let target = $("#checkout-items"),
    f = $("#checkout-form");
  if (!target || !f) return;
  let quote = cart.some((x) => !products.find((p) => p.id === x.id)?.price),
    total = cart.reduce(
      (n, x) => n + (products.find((p) => p.id === x.id)?.price || 0) * x.qty,
      0,
    );
  target.innerHTML =
    cart
      .map((x) => {
        let p = products.find((z) => z.id === x.id);
        return p
          ? '<div class="checkout-line"><img src="' +
              p.image +
              '" alt=""><div><strong>' +
              esc(p.name) +
              "</strong><small>" +
              x.qty +
              " × " +
              (p.price ? money(p.price) : "Price to be confirmed") +
              "</small></div><b>" +
              (p.price ? money(p.price * x.qty) : "—") +
              "</b></div>"
          : "";
      })
      .join("") ||
    '<div class="empty-state">Your bag is empty. <a href="shop.html">Browse the shop →</a></div>';
  if (cart.length)
    target.insertAdjacentHTML(
      "beforeend",
      '<h3 style="display:flex;justify-content:space-between;margin-top:25px">Total <span>' +
        (quote ? "To be confirmed" : money(total)) +
        "</span></h3>",
    );
  f.onsubmit = (e) => {
    e.preventDefault();
    if (!cart.length) {
      $("#checkout-feedback").textContent = "Your bag is empty.";
      return;
    }
    let a = get("ps_orders", []);
    a.unshift({
      id: "PS-" + Date.now(),
      items: cart,
      customer: Object.fromEntries(new FormData(f)),
      total: quote ? null : total,
      status: "Pending confirmation",
      date: new Date().toISOString(),
    });
    put("ps_orders", a);
    cart = [];
    syncCart();
    target.innerHTML =
      '<div class="empty-state"><h2>Order request received.</h2><p>Demo confirmation only—not a live order or payment.</p><a class="btn btn-dark" href="index.html">Back to home</a></div>';
    f.hidden = true;
  };
}
function admin() {
  let root = $("#admin-content");
  if (!root) return;
  let tab = "products";
  function draw() {
    if (tab === "products") {
      root.innerHTML =
        '<div class="admin-list">' +
        products
          .map(
            (p) =>
              '<div class="admin-row"><img src="' +
              esc(p.image) +
              '" alt=""><div><strong>' +
              esc(p.name) +
              "</strong><small>" +
              (p.price ? money(p.price) : "Price not set") +
              " · " +
              p.category +
              " · " +
              (p.published ? "Published" : "Hidden") +
              '</small></div><button data-edit="' +
              p.id +
              '">Edit</button></div>',
          )
          .join("") +
        '</div><div id="edit-slot"></div>';
      $$("[data-edit]").forEach(
        (b) => (b.onclick = () => edit(b.dataset.edit)),
      );
    } else {
      let a = get(tab === "orders" ? "ps_orders" : "ps_enquiries", []);
      root.innerHTML = a.length
        ? '<div class="admin-list">' +
          a
            .map(
              (x) =>
                '<div class="admin-edit"><strong>' +
                esc(x.id || x.name || "Enquiry") +
                "</strong><small>" +
                new Date(x.date).toLocaleString() +
                "</small><p>" +
                esc(x.customer?.name || x.name || "") +
                " · " +
                esc(x.customer?.phone || x.phone || "") +
                "</p><p>" +
                esc(x.customer?.address || x.message || "") +
                "</p>" +
                (x.total !== undefined
                  ? "<b>" +
                    (x.total === null ? "Quote required" : money(x.total)) +
                    " · " +
                    esc(x.status) +
                    "</b>"
                  : "") +
                "</div>",
            )
            .join("") +
          "</div>"
        : '<div class="empty-state">No ' +
          tab +
          " saved in this browser yet.</div>";
    }
  }
  function edit(id) {
    let p = products.find((x) => x.id === id);
    $("#edit-slot").innerHTML =
      '<form class="admin-edit" id="product-edit"><div class="form-row"><label>Product name<input name="name" value="' +
      esc(p.name) +
      '" required></label><label>Category<select name="category"><option value="tableware">Tableware</option><option value="decor">Decor</option><option value="planters">Planters</option></select></label></div><div class="form-row"><label>Price (BDT)<input name="price" type="number" min="1" value="' +
      (p.price || "") +
      '" placeholder="Set price"></label><label>Image path<input name="image" value="' +
      esc(p.image) +
      '"></label></div><label>Description<textarea name="description" rows="3">' +
      esc(p.description) +
      '</textarea></label><label class="check-line"><input name="published" type="checkbox" ' +
      (p.published ? "checked" : "") +
      '> Visible in shop</label><button class="btn btn-dark">Save product</button></form>';
    let f = $("#product-edit");
    f.elements.category.value = p.category;
    f.onsubmit = (e) => {
      e.preventDefault();
      let d = Object.fromEntries(new FormData(f));
      Object.assign(p, {
        name: d.name,
        category: d.category,
        price: d.price ? Number(d.price) : null,
        image: d.image,
        description: d.description,
        published: f.elements.published.checked,
      });
      put("ps_products", products);
      draw();
    };
  }
  $$("[data-admin-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.adminTab;
        $$(".admin-tab").forEach((x) => x.classList.toggle("active", x === b));
        draw();
      }),
  );
  draw();
}
function cursor() {
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  document.body.classList.add("custom-cursor");
  let d = $(".cursor-dot"),
    r = $(".cursor-ring"),
    x = 0,
    y = 0,
    rx = 0,
    ry = 0;
  document.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    d.style.left = x + "px";
    d.style.top = y + "px";
  });
  function tick() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    r.style.left = rx + "px";
    r.style.top = ry + "px";
    requestAnimationFrame(tick);
  }
  tick();
  document.addEventListener("mouseover", (e) =>
    r.classList.toggle("hover", !!e.target.closest("a,button")),
  );
}
function slow() {
  let el = $("#slow-loader"),
    c =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
  if (el && c && (c.saveData || /2g/.test(c.effectiveType || ""))) {
    el.classList.add("show");
    window.addEventListener(
      "load",
      () => setTimeout(() => el.classList.remove("show"), 900),
      { once: true },
    );
    setTimeout(() => el.classList.remove("show"), 7000);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  shell();
  slow();
  let p = document.body.dataset.page;
  if (p === "home") render($("#featured-products"));
  if (p === "shop") shop();
  if (p === "wholesale") wholesale();
  if (p === "checkout") checkout();
  if (p === "admin") admin();
});
