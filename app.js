(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = { products: "ps_products_v2", cart: "ps_cart_v2", orders: "ps_orders_v2", enquiries: "ps_enquiries_v2" };
  const PAY_LABEL = { cod: "Cash on delivery (request)", bkash: "bKash", nagad: "Nagad", rocket: "Rocket", card: "Debit / credit card" };
  const seed = Array.from({ length: 21 }, (_, i) => ({
    id: "piece-" + (i + 1), name: "Draft piece " + String(i + 1).padStart(2, "0"),
    category: "",
    description: "Handmade pottery. Please contact us to confirm dimensions, finish and availability.",
    image: "img/pottery_shop_" + (i + 1) + ".jpg", price: null, stock: null, published: true
  }));
  const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const money = value => "৳" + Number(value).toLocaleString("en-BD");
  let products = read(KEY.products, read("ps_products", seed));
  let cart = read(KEY.cart, read("ps_cart", []));
  let activeFilter = "all";
  const byId = id => products.find(p => p.id === id);
  const cartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const hasSpecialPrice = p => !!p && p.offerPrice !== null && p.offerPrice !== undefined && p.offerPrice !== "" && Number.isFinite(Number(p.offerPrice));
  const unitPrice = p => !p ? null : hasSpecialPrice(p) ? Number(p.offerPrice) : (p.price === null || p.price === undefined || p.price === "" ? null : Number(p.price));
  const stockOf = p => (!p || p.stock === null || p.stock === undefined || p.stock === "") ? null : Number(p.stock);
  const validBDPhone = value => /^(0|880)?1[3-9]\d{8}$/.test(String(value || "").replace(/\D/g, ""));
  const cartTotal = () => cart.reduce((sum, item) => sum + (unitPrice(byId(item.id)) || 0) * item.qty, 0);
  const needsQuote = () => cart.some(item => byId(item.id) && unitPrice(byId(item.id)) === null);
  // Remove unpublished or deleted pieces and cap quantities at available stock.
  function sanitizeCart() {
    cart = cart.filter(item => { const p = byId(item.id); return p && p.published && item.qty > 0; });
    cart.forEach(item => { const max = stockOf(byId(item.id)); if (max !== null && item.qty > max) item.qty = Math.max(0, max); });
    cart = cart.filter(item => item.qty > 0);
  }
  function saveProducts() { write(KEY.products, products); }
  function saveCart() { write(KEY.cart, cart); const count = $("#cart-count"); if (count) count.textContent = cartCount(); }
  function header() {
    const page = document.body.dataset.page || "";
    const active = name => page === name ? "active" : "";
    $("#site-header").innerHTML = '<header class="site-header"><a class="brand" href="index.html" aria-label="Pottery Shop home"><img src="img/logo.jpg" alt="Pottery Shop" class="site-logo"></a><nav class="nav" id="main-nav" aria-label="Main navigation"><a class="' + active("home") + '" href="index.html">Home</a><a class="' + active("shop") + '" href="shop.html">Shop</a><a class="' + active("story") + '" href="story.html">Our story</a><a class="' + active("wholesale") + '" href="wholesale.html">Wholesale</a></nav><div class="header-actions"><button class="cart-button" id="open-cart" type="button" aria-label="Open shopping bag">Bag <span class="cart-count" id="cart-count">0</span></button><button class="menu-toggle" id="menu-toggle" type="button" aria-label="Toggle navigation" aria-controls="main-nav" aria-expanded="false">☰</button></div></header>';
  }
  function footer() {
    $("#site-footer").innerHTML = '<footer class="site-footer"><div class="footer-contact-grid"><section class="footer-location"><span class="footer-kicker">FIND US</span><h3>Visit the studio</h3><div class="map-placeholder" role="note" aria-label="Studio location"><span class="map-placeholder-pin">⌖</span><strong>Find the studio</strong><small>Message us on Facebook for the studio address.</small></div><p class="footer-placeholder-note">Studio address: ask us on Facebook</p></section><section class="footer-contact"><span class="footer-kicker">GET IN TOUCH</span><h3>Contact us</h3><p>Questions about a piece, a custom order, or a collaboration? We would love to hear from you.</p><p><strong>Phone / WhatsApp</strong><br><span class="footer-placeholder-note">Message us on Facebook for our contact number</span></p><p><strong>Address</strong><br><span class="footer-placeholder-note">Message us on Facebook for the studio address</span></p><a href="https://www.facebook.com/Potteryshop25" target="_blank" rel="noopener noreferrer">Message us on Facebook ↗</a></section></div><div class="footer-top"><div><div class="footer-brand">Pottery Shop <span style="color:#d59a7b">✳</span></div><p>Thoughtful handmade pottery for everyday rituals. A little story shaped in clay.</p><p>বাংলার মাটি, হাতের ছোঁয়া</p></div><div class="footer-links"><a href="shop.html">Shop</a><a href="story.html">Our story</a><a href="wholesale.html">Wholesale</a><a href="policies.html">Policies</a><a href="https://www.facebook.com/Potteryshop25" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div></div><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Pottery Shop. Made with care.</span><a href="policies.html">Delivery, returns &amp; privacy</a></div></footer>';
  }
  function shell() {
    header(); footer();
    $("#ui-root").innerHTML = '<div class="cart-overlay" id="cart-overlay" aria-hidden="true"><aside class="cart-panel" role="dialog" aria-modal="true" aria-label="Shopping bag"><div class="cart-head"><h2>Your bag</h2><button class="close-cart" id="close-cart" type="button" aria-label="Close bag">×</button></div><div class="cart-items" id="cart-items"></div><div id="cart-summary"></div></aside></div><div class="cursor-dot" aria-hidden="true"></div><div class="cursor-ring" aria-hidden="true"></div><div class="toast" id="site-toast" role="status" aria-live="polite"></div>';
    $("#open-cart").addEventListener("click", openCart);
    $("#close-cart").addEventListener("click", closeCart);
    $("#cart-overlay").addEventListener("click", e => { if (e.target.id === "cart-overlay") closeCart(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { closeCart(); closeNav(); return; }
      const overlay = $("#cart-overlay"), panel = $(".cart-panel");
      if (e.key !== "Tab" || !overlay || !overlay.classList.contains("open") || !panel) return;
      const focusables = $$("button, a[href], input, select, textarea", panel).filter(el => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    $("#menu-toggle").addEventListener("click", () => { const nav = $("#main-nav"); const open = nav.classList.toggle("open"); $("#menu-toggle").setAttribute("aria-expanded", String(open)); });
    $("#main-nav").addEventListener("click", e => { if (e.target.closest("a")) closeNav(); });
    sanitizeCart(); saveCart(); cursor();
  }
  let lastFocus = null;
  function openCart() { lastFocus = document.activeElement; const overlay = $("#cart-overlay"); overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; drawCart(); $("#close-cart").focus(); }
  function closeCart() {
    const overlay = $("#cart-overlay"); if (!overlay || !overlay.classList.contains("open")) return;
    overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
  function closeNav() { const nav = $("#main-nav"), toggle = $("#menu-toggle"); if (nav && nav.classList.contains("open")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } }
  let toastTimer;
  function toast(message) { const el = $("#site-toast"); if (!el) return; el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2300); }
  function card(product) {
    const unit = unitPrice(product);
    const priceLabel = unit === null ? "Price on request" : money(unit);
    return '<article class="product-card"><div class="product-image"><img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy">' + (product.category ? '<span class="product-tag">' + esc(product.category) + '</span>' : '') + '<span class="product-price-tag">' + priceLabel + '</span></div><div class="product-info"><div><h3>' + esc(product.name) + '</h3><p>' + esc(product.description || "A handmade piece from our collection.") + '</p><button class="product-cta" type="button" data-add="' + esc(product.id) + '">Add to bag →</button> <button class="product-cta" type="button" data-enquire="' + esc(product.id) + '">Ask a question</button></div></div></article>';
  }
  function renderProducts(target, category, query) {
    if (!target) return;
    const list = products.filter(p => p.published && (category === "all" || p.category === category) && (String(p.name) + " " + String(p.description)).toLowerCase().includes((query || "").toLowerCase()));
    const emptyText = products.some(p => p.published) ? "No pieces found. Try another search." : "Our collection is being prepared. Check back soon.";
    target.innerHTML = list.length ? list.map(card).join("") : '<div class="empty-state">' + emptyText + '</div>';
    $$("[data-add]", target).forEach(button => button.addEventListener("click", () => addToCart(button.dataset.add)));
    $$("[data-enquire]", target).forEach(button => button.addEventListener("click", () => { const p = byId(button.dataset.enquire); location.href = "wholesale.html?piece=" + encodeURIComponent(p ? p.name : ""); }));
  }
  function addToCart(id) {
    const p = byId(id); if (!p || !p.published) return;
    const max = stockOf(p), item = cart.find(x => x.id === id), current = item ? item.qty : 0;
    if (max !== null && current + 1 > max) { toast(max <= 0 ? "Sorry, this piece is sold out." : "Only " + max + " left in stock."); return; }
    if (item) item.qty += 1; else cart.push({ id, qty: 1 });
    saveCart(); toast(p.name + " added to your bag."); drawCart();
  }
  function drawCart() {
    const box = $("#cart-items"), summary = $("#cart-summary"); if (!box || !summary) return;
    sanitizeCart();
    box.innerHTML = cart.map(item => {
      const p = byId(item.id);
      return '<div class="cart-item"><img src="' + esc(p.image) + '" alt=""><div><strong>' + esc(p.name) + '</strong><small>' + (unitPrice(p) === null ? "Price to be confirmed" : money(unitPrice(p))) + '</small><div class="qty-controls"><button type="button" data-qty="' + esc(p.id) + '" data-step="-1" aria-label="Decrease quantity">−</button><span>' + item.qty + '</span><button type="button" data-qty="' + esc(p.id) + '" data-step="1" aria-label="Increase quantity">+</button></div></div><button class="small-btn" type="button" data-remove="' + esc(p.id) + '">Remove</button></div>';
    }).join("") || '<div class="empty-state">Your bag is waiting for something lovely.</div>';
    summary.innerHTML = cart.length ? '<div class="cart-total"><span>Subtotal</span><span>' + (needsQuote() ? "To be confirmed" : money(cartTotal())) + '</span></div><a class="btn btn-dark" style="width:100%" href="checkout.html">Continue to checkout →</a><p class="form-note">Final delivery charge and availability are confirmed by our team.</p>' : "";
    $$("[data-qty]").forEach(button => button.addEventListener("click", () => {
      const item = cart.find(x => x.id === button.dataset.qty); if (!item) return;
      const step = Number(button.dataset.step), max = stockOf(byId(item.id));
      if (step > 0 && max !== null && item.qty + step > max) { toast("Only " + max + " left in stock."); return; }
      item.qty += step; cart = cart.filter(x => x.qty > 0); saveCart(); drawCart();
    }));
    $$("[data-remove]").forEach(button => button.addEventListener("click", () => { cart = cart.filter(x => x.id !== button.dataset.remove); saveCart(); drawCart(); }));
    saveCart();
  }
  function homeProductCarousel() {
    const track = $("#featured-carousel-track");
    const controls = $("#featured-carousel-controls");
    if (!track) return;
    const bestSellers = products.filter(p => p.published && p.bestSeller === true);
    const eligibleOffers = products.filter(p => p.published && p.bestSeller !== true && hasSpecialPrice(p));
    const offerKey = "ps_featured_offer_v1";
    const today = new Date().toISOString().slice(0, 10);
    const savedOffer = read(offerKey, null);
    let offer = savedOffer && savedOffer.date === today ? byId(savedOffer.id) : null;
    if (!offer || !offer.published || offer.bestSeller || !hasSpecialPrice(offer)) {
      offer = eligibleOffers.length ? eligibleOffers[Math.floor(Math.random() * eligibleOffers.length)] : null;
      if (offer) write(offerKey, { id: offer.id, date: today });
      else localStorage.removeItem(offerKey);
    }
    const cards = [
      ...bestSellers.map(product => ({ product, tag: "Best Sold", kind: "best" })),
      ...(offer ? [{ product: offer, tag: "Special Offer", kind: "offer" }] : [])
    ];
    if (!cards.length) {
      track.innerHTML = '<div class="featured-empty">Our studio favourites are being selected. Check back soon.</div>';
      if (controls) controls.hidden = true;
      return;
    }
    const cardHtml = item => {
      const p = item.product;
      const hasOffer = hasSpecialPrice(p);
      const price = hasOffer
        ? '<span class="featured-old-price">' + (p.price == null ? "" : money(p.price)) + '</span><strong class="featured-offer-price">' + money(p.offerPrice) + '</strong>'
        : (p.price == null || p.price === "" ? '<span>Price to be confirmed</span>' : '<strong>' + money(p.price) + '</strong>');
      const offerNote = item.kind === "offer" && !hasOffer ? '<small class="featured-price-note">Offer price to be set by the shop</small>' : "";
      return '<article class="featured-slide"><a class="featured-slide-image" href="shop.html" tabindex="-1"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"><span class="featured-product-tag ' + item.kind + '">' + item.tag + '</span></a><div class="featured-slide-copy"><span class="featured-slide-meta">' + esc(p.category) + '</span><h3>' + esc(p.name) + '</h3><p class="featured-slide-price">' + price + '</p>' + offerNote + '<div class="featured-slide-actions"><button class="product-cta" type="button" data-featured-add="' + esc(p.id) + '">Add to bag →</button><a class="product-cta" href="shop.html">View piece</a></div></div></article>';
    };
    const sequence = cards.map(cardHtml).join("");
    // Copies are for the seamless loop only: hide them from assistive tech and the tab order.
    const hiddenSequence = sequence.replace(/<button class="product-cta"/g, '<button tabindex="-1" class="product-cta"').replace(/<a class="product-cta"/g, '<a tabindex="-1" class="product-cta"');
    const repeatCount = Math.max(2, Math.ceil((window.innerWidth * 2) / (cards.length * 290)) + 1);
    const visibleSeq = '<div class="featured-marquee-seq">' + sequence + '</div>';
    const hiddenSeq = '<div class="featured-marquee-seq" aria-hidden="true">' + hiddenSequence + '</div>';
    const group = '<div class="featured-marquee-group">' + visibleSeq + Array.from({ length: repeatCount - 1 }, () => hiddenSeq).join("") + '</div>';
    const copy = '<div class="featured-marquee-group" aria-hidden="true">' + Array.from({ length: repeatCount }, () => hiddenSeq).join("") + '</div>';
    track.innerHTML = group + copy;
    track.querySelectorAll("[data-featured-add]").forEach(button => button.addEventListener("click", () => addToCart(button.dataset.featuredAdd)));
    if (controls) {
      controls.hidden = false;
      const toggle = controls.querySelector("[data-carousel-toggle]");
      if (toggle) toggle.addEventListener("click", () => {
        const paused = track.classList.toggle("is-paused");
        toggle.textContent = paused ? "Play" : "Pause";
      });
    }
  }
  function shop() {
    renderProducts($("#shop-products"), activeFilter, "");
    $("#product-search")?.addEventListener("input", e => renderProducts($("#shop-products"), activeFilter, e.target.value));
    $$("[data-filter]").forEach(button => button.addEventListener("click", () => { $$(".filter").forEach(x => x.classList.remove("active")); button.classList.add("active"); activeFilter = button.dataset.filter; renderProducts($("#shop-products"), activeFilter, $("#product-search")?.value || ""); }));
  }
  function wholesale() {
    const form = $("#wholesale-form"); if (!form) return;
    const piece = new URLSearchParams(location.search).get("piece");
    if (piece) form.elements.message.value = "I have a question about: " + piece + "\n\n";
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!validBDPhone(form.elements.phone.value)) { $("#wholesale-feedback").textContent = "Please enter a valid Bangladesh mobile number, for example 017XXXXXXXX."; form.elements.phone.focus(); return; }
      const entries = read(KEY.enquiries, []);
      entries.unshift({ ...Object.fromEntries(new FormData(form)), id: "ENQ-" + Date.now(), date: new Date().toISOString() });
      write(KEY.enquiries, entries); form.reset();
      $("#wholesale-feedback").textContent = "Your enquiry is saved on this device only and has not been sent to the shop yet. Please also message us on Facebook.";
    });
  }
  function checkout() {
    const target = $("#checkout-items"), form = $("#checkout-form"); if (!target || !form) return;
    const draw = () => {
      sanitizeCart(); saveCart();
      target.innerHTML = cart.map(item => {
        const p = byId(item.id); if (!p) return "";
        const unit = unitPrice(p);
        return '<div class="checkout-line"><img src="' + esc(p.image) + '" alt=""><div><strong>' + esc(p.name) + '</strong><small>' + item.qty + " × " + (unit === null ? "Price on request" : money(unit)) + '</small></div><b>' + (unit === null ? "—" : money(unit * item.qty)) + '</b></div>';
      }).join("") || '<div class="empty-state">Your bag is empty. <a href="shop.html">Browse the shop →</a></div>';
      if (cart.length) target.insertAdjacentHTML("beforeend", '<h3 style="display:flex;justify-content:space-between;margin-top:25px">Subtotal <span>' + (needsQuote() ? "To be confirmed" : money(cartTotal())) + '</span></h3><p class="form-note">Delivery charge and final availability will be confirmed before dispatch.</p>');
    };
    draw();
    const payment = $("#payment-method"), note = $("#payment-explainer");
    payment?.addEventListener("change", () => { note.textContent = payment.value === "cod" ? "Cash on delivery is a request and will be confirmed by the shop." : "Online payment is not connected yet. This records your preferred method only; do not send money until the shop confirms an official payment link."; });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!cart.length) { $("#checkout-feedback").textContent = "Your bag is empty."; return; }
      if (!validBDPhone(form.elements.phone.value)) { $("#checkout-feedback").textContent = "Please enter a valid Bangladesh mobile number, for example 017XXXXXXXX."; form.elements.phone.focus(); return; }
      const order = { id: "PS-" + Date.now(), items: cart.map(x => { const p = byId(x.id); return { id: x.id, name: p ? p.name : x.id, qty: x.qty, unitPrice: unitPrice(p) }; }), customer: Object.fromEntries(new FormData(form)), total: needsQuote() ? null : cartTotal(), paymentStatus: "Not paid", status: "Pending shop confirmation", date: new Date().toISOString() };
      const orders = read(KEY.orders, []); orders.unshift(order); write(KEY.orders, orders);
      cart = []; saveCart(); target.innerHTML = '<div class="empty-state"><h2>Your order request is saved on this device.</h2><p>Reference: <strong>' + esc(order.id) + '</strong></p><p>It has not been sent to the shop yet, and no payment has been taken. To confirm, message the shop on its official Facebook page with this reference.</p><a class="btn btn-dark" href="index.html">Back to home</a></div>';
      form.hidden = true;
    });
  }
  function admin() {
    const root=$("#admin-content"); if(!root)return;
    let tab="products";
    function draw(){
      if(tab==="products"){
        root.innerHTML='<div class="admin-actions"><p>Set the actual BDT selling price for each product, then save that row.</p><button class="btn btn-dark" id="new-product" type="button">+ Add product</button></div><div class="admin-list">'+products.map(p=>'<div class="admin-row" data-product-row="'+esc(p.id)+'"><img src="'+esc(p.image)+'" alt=""><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.category)+' · '+(p.published?"Visible in shop":"Hidden from shop")+'</small></div><div class="admin-price-cell"><input class="admin-price-input" type="number" min="0" step="1" inputmode="numeric" aria-label="Price in BDT for '+esc(p.name)+'" placeholder="Price in ৳" value="'+(p.price==null?"":esc(p.price))+'"><small>'+(p.price==null?"No price set":"Current: "+money(p.price))+'</small></div><button type="button" data-save-price="'+esc(p.id)+'">Save price</button><button type="button" data-edit="'+esc(p.id)+'">Details</button></div>').join("")+'</div><div id="edit-slot"></div>';
        $("#new-product").addEventListener("click",()=>edit(null));
        $$("[data-save-price]",root).forEach(button=>button.addEventListener("click",()=>{
          const p=byId(button.dataset.savePrice),row=button.closest("[data-product-row]"),input=$(".admin-price-input",row);
          if(!p||input.value.trim()===""||!Number.isFinite(Number(input.value))||Number(input.value)<0){toast("Enter a valid price in BDT.");input.focus();return;}
          p.price=Number(input.value);saveProducts();const small=$(".admin-price-cell small",row);small.textContent="Current: "+money(p.price);toast("Price saved on this device.");
        }));
        $$("[data-edit]",root).forEach(button=>button.addEventListener("click",()=>edit(button.dataset.edit)));
      }else{
        const items=read(tab==="orders"?KEY.orders:KEY.enquiries,[]);
        root.innerHTML=items.length?'<div class="admin-list">'+items.map(item=>{
          if(tab==="orders"){
            const lines=(item.items||[]).map(l=>'<li>'+esc(l.name||l.id)+' × '+Number(l.qty)+(l.unitPrice==null?"":" = "+money(Number(l.unitPrice)*Number(l.qty)))+'</li>').join("");
            return '<article class="admin-edit"><strong>'+esc(item.id)+'</strong><small>'+new Date(item.date).toLocaleString()+'</small><p>'+esc(item.customer?.name||"")+' · '+esc(item.customer?.phone||"")+'</p><p>'+esc(item.customer?.address||"")+'</p><ul class="admin-order-lines">'+lines+'</ul><b>'+(item.total==null?"Quote required":money(item.total))+' · '+esc(item.status)+'</b><p>Payment: '+esc(PAY_LABEL[item.customer?.payment]||"Not specified")+' · '+esc(item.paymentStatus||"Not paid")+'</p>'+(item.customer?.note?'<p>Note: '+esc(item.customer.note)+'</p>':'')+'</article>';
          }
          return '<article class="admin-edit"><strong>'+esc(item.id||"Enquiry")+'</strong><small>'+new Date(item.date).toLocaleString()+'</small><p>'+esc(item.name||"")+' · '+esc(item.business||"")+' · '+esc(item.phone||"")+' · '+esc(item.email||"")+'</p><p>'+esc(item.type||"")+' · '+esc(item.quantity||"")+'</p><p>'+esc(item.message||"")+'</p></article>';
        }).join("")+'</div>':'<div class="empty-state">No '+(tab==="orders"?"orders":"wholesale enquiries")+' saved in this browser yet.</div>';
      }
    }
    function edit(id){
      const existing=id?byId(id):null;
      const p=existing||{id:"piece-"+Date.now(),name:"",category:"",description:"",image:"img/pottery_shop_1.jpg",price:"",stock:"",published:false};
      $("#edit-slot").innerHTML='<form class="admin-edit" id="product-edit"><h3>'+(existing?"Edit product details":"Add a product")+'</h3><div class="form-row"><label>Product name<input name="name" required maxlength="80" value="'+esc(p.name)+'"></label><label>Category<select name="category"><option value="">Uncategorised</option><option value="tableware">Tableware</option><option value="decor">Decor</option><option value="planters">Planters</option></select></label></div><div class="form-row"><label>Price (BDT)<input name="price" type="number" min="0" step="1" inputmode="numeric" value="'+(p.price==null?"":esc(p.price))+'" placeholder="Leave blank for quote"></label><label>Stock quantity<input name="stock" type="number" min="0" step="1" value="'+(p.stock==null?"":esc(p.stock))+'" placeholder="Optional"></label></div><div class="form-row"><label>Offer price (BDT)<input name="offerPrice" type="number" min="0" step="1" inputmode="numeric" value="'+(p.offerPrice==null?"":esc(p.offerPrice))+'" placeholder="Optional special price"></label><label class="check-line"><input name="bestSeller" type="checkbox" '+(p.bestSeller?"checked":"")+'> Mark as Best Sold</label></div><label>Image path<input name="image" required value="'+esc(p.image)+'"></label><label>Description<textarea name="description" rows="3">'+esc(p.description)+'</textarea></label><label class="check-line"><input name="published" type="checkbox" '+(p.published?"checked":"")+'> Show in shop</label><div class="admin-actions"><button class="btn btn-dark" type="submit">Save product details</button><button class="small-btn" type="button" id="cancel-edit">Cancel</button>'+(existing?'<button class="small-btn" type="button" id="delete-product">Delete product</button>':'')+'</div></form>';
      const form=$("#product-edit");form.elements.category.value=p.category;
      $("#cancel-edit").addEventListener("click",()=>{$("#edit-slot").innerHTML="";});
      $("#delete-product")?.addEventListener("click",()=>{if(confirm("Delete this product from this browser catalogue?")){products=products.filter(x=>x.id!==p.id);cart=cart.filter(x=>x.id!==p.id);saveProducts();saveCart();draw();}});
      form.addEventListener("submit",event=>{
        event.preventDefault();
        const data=new FormData(form);
        const price=data.get("price"),stock=data.get("stock");
        const updated={...p,name:String(data.get("name")).trim(),category:String(data.get("category")),price:price===""?null:Number(price),stock:stock===""?null:Number(stock),image:String(data.get("image")).trim(),description:String(data.get("description")).trim(),published:form.elements.published.checked,bestSeller:form.elements.bestSeller.checked,offerPrice:data.get("offerPrice")===""?null:Number(data.get("offerPrice"))};
        if(!updated.name||!updated.image||((price!=="")&&(!Number.isFinite(updated.price)||updated.price<0))||(updated.offerPrice!==null&&(!Number.isFinite(updated.offerPrice)||updated.offerPrice<0))){toast("Please check the product details and price.");return;}
        if(!/^img\/[^\/\\]+\.(jpe?g|png|webp|gif)$/i.test(updated.image)){toast("Image must be a file inside the img folder, for example img/your-photo.jpg.");return;}
        const probe=new Image();
        probe.onerror=()=>toast("That image was not found. Put the file in the img folder first.");
        probe.onload=()=>{if(existing)Object.assign(existing,updated);else products.unshift(updated);saveProducts();draw();toast("Product details saved on this device.");};
        probe.src=updated.image;
      });
    }
    $$("[data-admin-tab]").forEach(button=>button.addEventListener("click",()=>{tab=button.dataset.adminTab;$$(".admin-tab").forEach(x=>x.classList.toggle("active",x===button));draw();}));
    draw();
  }
  function cursor() {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = $(".cursor-dot"), ring = $(".cursor-ring"); if (!dot || !ring) return;
    document.body.classList.add("custom-cursor"); let x = 0, y = 0, rx = 0, ry = 0;
    // Keep the same dot-and-ring effect active above every interactive layer, including the cart and music control.
    const position = event => {
      x = event.clientX; y = event.clientY;
      dot.style.left = x + "px"; dot.style.top = y + "px";
    };
    document.addEventListener("pointermove", position, { passive: true });
    const tick = () => {
      rx += (x - rx) * .14; ry += (y - ry) * .14;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(tick);
    };
    tick();
    document.addEventListener("pointerover", event => {
      const target = event.target instanceof Element ? event.target : null;
      ring.classList.toggle("hover", !!target?.closest("a,button,input,select,textarea,[role='button']"));
    });
  }
  function slowLoader() {
    const el = $("#slow-loader"); if (!el) return;
    try { if (sessionStorage.getItem("ps_loader_seen")) return; sessionStorage.setItem("ps_loader_seen", "1"); } catch (_) {}
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowNetwork = connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || "") || (connection.downlink && connection.downlink < 0.8));
    if (!slowNetwork) return;
    el.classList.add("show"); el.setAttribute("aria-hidden", "false");
    const hide = () => { el.classList.remove("show"); el.setAttribute("aria-hidden", "true"); };
    window.addEventListener("load", () => setTimeout(hide, 650), { once: true });
    setTimeout(hide, 6500);
  }
  document.addEventListener("DOMContentLoaded", () => {
    shell(); slowLoader();
    const page = document.body.dataset.page;
    if (page === "home") homeProductCarousel();
    if (page === "shop") shop();
    if (page === "wholesale") wholesale();
    if (page === "checkout") checkout();
    if (page === "admin") admin();
  });
})();