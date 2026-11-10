(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = { products: "ps_products_v2", cart: "ps_cart_v2", orders: "ps_orders_v2", enquiries: "ps_enquiries_v2" };
  const seed = Array.from({ length: 21 }, (_, i) => ({
    id: "piece-" + (i + 1), name: "Studio piece " + String(i + 1).padStart(2, "0"),
    category: ["tableware", "decor", "planters"][i % 3],
    description: "Handmade pottery from our photo collection. Please contact us to confirm dimensions, finish and availability.",
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
  const cartTotal = () => cart.reduce((sum, item) => sum + (Number(byId(item.id)?.price) || 0) * item.qty, 0);
  const needsQuote = () => cart.some(item => byId(item.id) && (byId(item.id).price === null || byId(item.id).price === "" || byId(item.id).price === undefined));
  function saveProducts() { write(KEY.products, products); }
  function saveCart() { write(KEY.cart, cart); const count = $("#cart-count"); if (count) count.textContent = cartCount(); }
  function header() {
    const page = document.body.dataset.page || "";
    const active = name => page === name ? "active" : "";
    $("#site-header").innerHTML = '<header class="site-header"><a class="brand" href="index.html" aria-label="Pottery Shop home"><img src="img/logo.jpg" alt="Pottery Shop" class="site-logo"></a><nav class="nav" id="main-nav" aria-label="Main navigation"><a class="' + active("home") + '" href="index.html">Home</a><a class="' + active("shop") + '" href="shop.html">Shop</a><a class="' + active("story") + '" href="story.html">Our story</a><a class="' + active("wholesale") + '" href="wholesale.html">Wholesale</a></nav><div class="header-actions"><button class="cart-button" id="open-cart" type="button" aria-label="Open shopping bag">Bag <span class="cart-count" id="cart-count">0</span></button><button class="menu-toggle" id="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button></div></header>';
  }
  function footer() {
    $("#site-footer").innerHTML = '<footer class="site-footer"><div class="footer-contact-grid"><section class="footer-location"><span class="footer-kicker">FIND US</span><h3>Visit the studio</h3><div class="map-placeholder" role="note" aria-label="Map location to be added"><span class="map-placeholder-pin">⌖</span><strong>Our map is coming soon</strong><small>Studio location will be added once confirmed.</small></div><p class="footer-placeholder-note">Address: To be confirmed</p></section><section class="footer-contact"><span class="footer-kicker">GET IN TOUCH</span><h3>Contact us</h3><p>Questions about a piece, a custom order, or a collaboration? We would love to hear from you.</p><p><strong>Phone / WhatsApp</strong><br><span class="footer-placeholder-note">Number to be provided</span></p><p><strong>Address</strong><br><span class="footer-placeholder-note">To be confirmed</span></p><a href="https://www.facebook.com/Potteryshop25" target="_blank" rel="noopener noreferrer">Message us on Facebook ↗</a></section></div><div class="footer-top"><div><div class="footer-brand">Pottery Shop <span style="color:#d59a7b">✳</span></div><p>Thoughtful handmade pottery for everyday rituals. A little story shaped in clay.</p><p>বাংলার মাটি, হাতের ছোঁয়া</p></div><div class="footer-links"><a href="shop.html">Shop</a><a href="story.html">Our story</a><a href="wholesale.html">Wholesale</a><a href="https://www.facebook.com/Potteryshop25" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div></div><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Pottery Shop. Made with care.</span><a href="admin.html">Studio workspace</a></div></footer>';
  }
  function shell() {
    header(); footer();
    $("#ui-root").innerHTML = '<div class="cart-overlay" id="cart-overlay" aria-hidden="true"><aside class="cart-panel" role="dialog" aria-modal="true" aria-label="Shopping bag"><div class="cart-head"><h2>Your bag</h2><button class="close-cart" id="close-cart" type="button" aria-label="Close bag">×</button></div><div class="cart-items" id="cart-items"></div><div id="cart-summary"></div></aside></div><div class="cursor-dot" aria-hidden="true"></div><div class="cursor-ring" aria-hidden="true"></div><div class="toast" id="site-toast" role="status" aria-live="polite"></div>';
    $("#open-cart").addEventListener("click", () => { $("#cart-overlay").classList.add("open"); $("#cart-overlay").setAttribute("aria-hidden", "false"); drawCart(); $("#close-cart").focus(); });
    $("#close-cart").addEventListener("click", closeCart);
    $("#cart-overlay").addEventListener("click", e => { if (e.target.id === "cart-overlay") closeCart(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
    $("#menu-toggle").addEventListener("click", () => { const nav = $("#main-nav"); const open = nav.classList.toggle("open"); $("#menu-toggle").setAttribute("aria-expanded", String(open)); });
    saveCart(); cursor();
  }
  function closeCart() { const overlay = $("#cart-overlay"); if (!overlay) return; overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true"); }
  let toastTimer;
  function toast(message) { const el = $("#site-toast"); if (!el) return; el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2300); }
  function card(product) {
    const priceLabel = product.price === null || product.price === "" || product.price === undefined ? "Price on request" : money(product.price);
    return '<article class="product-card"><div class="product-image"><img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy"><span class="product-tag">' + esc(product.category) + '</span><span class="product-price-tag">' + priceLabel + '</span></div><div class="product-info"><div><h3>' + esc(product.name) + '</h3><p>' + esc(product.description || "A handmade piece from our collection.") + '</p><button class="product-cta" type="button" data-add="' + esc(product.id) + '">Add to bag →</button> <button class="product-cta" type="button" data-enquire="' + esc(product.id) + '">Ask a question</button></div></div></article>';
  }
  function renderProducts(target, category, query) {
    if (!target) return;
    const list = products.filter(p => p.published && (category === "all" || p.category === category) && (String(p.name) + " " + String(p.description)).toLowerCase().includes((query || "").toLowerCase()));
    target.innerHTML = list.length ? list.map(card).join("") : '<div class="empty-state">No pieces found. Try another search.</div>';
    $$("[data-add]", target).forEach(button => button.addEventListener("click", () => addToCart(button.dataset.add)));
    $$("[data-enquire]", target).forEach(button => button.addEventListener("click", () => { const p = byId(button.dataset.enquire); location.href = "wholesale.html?piece=" + encodeURIComponent(p ? p.name : ""); }));
  }
  function addToCart(id) {
    const p = byId(id); if (!p || !p.published) return;
    const item = cart.find(x => x.id === id);
    if (item) item.qty += 1; else cart.push({ id, qty: 1 });
    saveCart(); toast(p.name + " added to your bag."); drawCart();
  }
  function drawCart() {
    const box = $("#cart-items"), summary = $("#cart-summary"); if (!box || !summary) return;
    cart = cart.filter(item => byId(item.id) && item.qty > 0);
    box.innerHTML = cart.map(item => {
      const p = byId(item.id);
      return '<div class="cart-item"><img src="' + esc(p.image) + '" alt=""><div><strong>' + esc(p.name) + '</strong><small>' + (p.price == null || p.price === "" ? "Price to be confirmed" : money(p.price)) + '</small><div class="qty-controls"><button type="button" data-qty="' + esc(p.id) + '" data-step="-1" aria-label="Decrease quantity">−</button><span>' + item.qty + '</span><button type="button" data-qty="' + esc(p.id) + '" data-step="1" aria-label="Increase quantity">+</button></div></div><button class="small-btn" type="button" data-remove="' + esc(p.id) + '">Remove</button></div>';
    }).join("") || '<div class="empty-state">Your bag is waiting for something lovely.</div>';
    summary.innerHTML = cart.length ? '<div class="cart-total"><span>Subtotal</span><span>' + (needsQuote() ? "To be confirmed" : money(cartTotal())) + '</span></div><a class="btn btn-dark" style="width:100%" href="checkout.html">Continue to checkout →</a><p class="form-note">Final delivery charge and availability are confirmed by our team.</p>' : "";
    $$("[data-qty]").forEach(button => button.addEventListener("click", () => { const item = cart.find(x => x.id === button.dataset.qty); if (!item) return; item.qty += Number(button.dataset.step); cart = cart.filter(x => x.qty > 0); saveCart(); drawCart(); }));
    $$("[data-remove]").forEach(button => button.addEventListener("click", () => { cart = cart.filter(x => x.id !== button.dataset.remove); saveCart(); drawCart(); }));
    saveCart();
  }
  function shop() {
    renderProducts($("#shop-products"), activeFilter, "");
    $("#product-search")?.addEventListener("input", e => renderProducts($("#shop-products"), activeFilter, e.target.value));
    $$("[data-filter]").forEach(button => button.addEventListener("click", () => { $$(".filter").forEach(x => x.classList.remove("active")); button.classList.add("active"); activeFilter = button.dataset.filter; renderProducts($("#shop-products"), activeFilter, $("#product-search").value); }));
  }
  function wholesale() {
    const form = $("#wholesale-form"); if (!form) return;
    const piece = new URLSearchParams(location.search).get("piece");
    if (piece) form.elements.message.value = "I would like to enquire about: " + piece + "\n\n";
    form.addEventListener("submit", event => {
      event.preventDefault();
      const entries = read(KEY.enquiries, []);
      entries.unshift({ ...Object.fromEntries(new FormData(form)), id: "ENQ-" + Date.now(), date: new Date().toISOString() });
      write(KEY.enquiries, entries); form.reset();
      $("#wholesale-feedback").textContent = "Enquiry saved in this browser preview. Connect a backend before accepting real enquiries.";
    });
  }
  function checkout() {
    const target = $("#checkout-items"), form = $("#checkout-form"); if (!target || !form) return;
    const draw = () => {
      target.innerHTML = cart.map(item => { const p = byId(item.id); return p ? '<div class="checkout-line"><img src="' + esc(p.image) + '" alt=""><div><strong>' + esc(p.name) + '</strong><small>' + item.qty + " × " + (p.price == null || p.price === "" ? "Price on request" : money(p.price)) + '</small></div><b>' + (p.price == null || p.price === "" ? "—" : money(Number(p.price) * item.qty)) + '</b></div>' : ""; }).join("") || '<div class="empty-state">Your bag is empty. <a href="shop.html">Browse the shop →</a></div>';
      if (cart.length) target.insertAdjacentHTML("beforeend", '<h3 style="display:flex;justify-content:space-between;margin-top:25px">Subtotal <span>' + (needsQuote() ? "To be confirmed" : money(cartTotal())) + '</span></h3><p class="form-note">Delivery charge and final availability will be confirmed before dispatch.</p>');
    };
    draw();
    const payment = $("#payment-method"), note = $("#payment-explainer");
    payment?.addEventListener("change", () => { note.textContent = payment.value === "cod" ? "Cash on delivery is a request and will be confirmed by the shop." : "Online payment is not connected yet. This records your preferred method only; do not send money until the shop confirms an official payment link."; });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!cart.length) { $("#checkout-feedback").textContent = "Your bag is empty."; return; }
      const order = { id: "PS-" + Date.now(), items: cart.map(x => ({ ...x })), customer: Object.fromEntries(new FormData(form)), total: needsQuote() ? null : cartTotal(), paymentStatus: "Not paid", status: "Pending shop confirmation", date: new Date().toISOString() };
      const orders = read(KEY.orders, []); orders.unshift(order); write(KEY.orders, orders);
      cart = []; saveCart(); target.innerHTML = '<div class="empty-state"><h2>Thank you. We received your order request.</h2><p>Reference: <strong>' + esc(order.id) + '</strong></p><p>This preview does not transmit orders to the shop or collect payment. Contact the shop through its official Facebook page to confirm.</p><a class="btn btn-dark" href="index.html">Back to home</a></div>';
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
        root.innerHTML=items.length?'<div class="admin-list">'+items.map(item=>'<article class="admin-edit"><strong>'+esc(item.id||item.name||"Enquiry")+'</strong><small>'+new Date(item.date).toLocaleString()+'</small><p>'+esc(item.customer?.name||item.name||"")+' · '+esc(item.customer?.phone||item.phone||"")+'</p><p>'+esc(item.customer?.address||item.message||"")+'</p>'+(item.total!==undefined?'<b>'+(item.total===null?"Quote required":money(item.total))+' · '+esc(item.status)+'</b><p>Payment: '+esc(item.customer?.payment||"Not specified")+' · '+esc(item.paymentStatus||"Not paid")+'</p>':'')+'</article>').join("")+'</div>':'<div class="empty-state">No '+tab+' saved in this browser yet.</div>';
      }
    }
    function edit(id){
      const existing=id?byId(id):null;
      const p=existing||{id:"piece-"+Date.now(),name:"",category:"decor",description:"",image:"img/pottery_shop_1.jpg",price:"",stock:"",published:false};
      $("#edit-slot").innerHTML='<form class="admin-edit" id="product-edit"><h3>'+(existing?"Edit product details":"Add a product")+'</h3><div class="form-row"><label>Product name<input name="name" required maxlength="80" value="'+esc(p.name)+'"></label><label>Category<select name="category"><option value="tableware">Tableware</option><option value="decor">Decor</option><option value="planters">Planters</option></select></label></div><div class="form-row"><label>Price (BDT)<input name="price" type="number" min="0" step="1" inputmode="numeric" value="'+(p.price==null?"":esc(p.price))+'" placeholder="Leave blank for quote"></label><label>Stock quantity<input name="stock" type="number" min="0" step="1" value="'+(p.stock==null?"":esc(p.stock))+'" placeholder="Optional"></label></div><label>Image path<input name="image" required value="'+esc(p.image)+'"></label><label>Description<textarea name="description" rows="3">'+esc(p.description)+'</textarea></label><label class="check-line"><input name="published" type="checkbox" '+(p.published?"checked":"")+'> Show in shop</label><div class="admin-actions"><button class="btn btn-dark" type="submit">Save product details</button><button class="small-btn" type="button" id="cancel-edit">Cancel</button>'+(existing?'<button class="small-btn" type="button" id="delete-product">Delete product</button>':'')+'</div></form>';
      const form=$("#product-edit");form.elements.category.value=p.category;
      $("#cancel-edit").addEventListener("click",()=>{$("#edit-slot").innerHTML="";});
      $("#delete-product")?.addEventListener("click",()=>{if(confirm("Delete this product from this browser catalogue?")){products=products.filter(x=>x.id!==p.id);cart=cart.filter(x=>x.id!==p.id);saveProducts();saveCart();draw();}});
      form.addEventListener("submit",event=>{
        event.preventDefault();
        const data=new FormData(form);
        const price=data.get("price"),stock=data.get("stock");
        const updated={...p,name:String(data.get("name")).trim(),category:String(data.get("category")),price:price===""?null:Number(price),stock:stock===""?null:Number(stock),image:String(data.get("image")).trim(),description:String(data.get("description")).trim(),published:form.elements.published.checked};
        if(!updated.name||!updated.image||((price!=="")&&(!Number.isFinite(updated.price)||updated.price<0))){toast("Please check the product details and price.");return;}
        if(existing)Object.assign(existing,updated);else products.unshift(updated);
        saveProducts();draw();toast("Product details saved on this device.");
      });
    }
    $$("[data-admin-tab]").forEach(button=>button.addEventListener("click",()=>{tab=button.dataset.adminTab;$$(".admin-tab").forEach(x=>x.classList.toggle("active",x===button));draw();}));
    draw();
  }
  function cursor() {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = $(".cursor-dot"), ring = $(".cursor-ring"); if (!dot || !ring) return;
    document.body.classList.add("custom-cursor"); let x = 0, y = 0, rx = 0, ry = 0;
    document.addEventListener("pointermove", event => { x = event.clientX; y = event.clientY; dot.style.left = x + "px"; dot.style.top = y + "px"; });
    const tick = () => { rx += (x - rx) * .14; ry += (y - ry) * .14; ring.style.left = rx + "px"; ring.style.top = ry + "px"; requestAnimationFrame(tick); }; tick();
    document.addEventListener("pointerover", event => ring.classList.toggle("hover", !!event.target.closest("a,button,input,select,textarea")));
  }
  function slowLoader() {
    const el = $("#slow-loader"); if (!el) return;
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
    if (page === "home") renderProducts($("#featured-products"), "all", "");
    if (page === "shop") shop();
    if (page === "wholesale") wholesale();
    if (page === "checkout") checkout();
    if (page === "admin") admin();
  });
})();