const products = [
    { id:1, name:"Wireless Bluetooth Headphones", cat:"electronics", emoji:"🎧", price:1499, oldPrice:2499, rating:4.5, reviews:128, badge:"SALE", tag:"sale" },
    { id:2, name:"Men's Casual T-Shirt", cat:"fashion", emoji:"👕", price:499, oldPrice:799, rating:4.2, reviews:85, badge:"NEW", tag:"new" },
    { id:3, name:"Smart LED Desk Lamp", cat:"home", emoji:"💡", price:899, oldPrice:1299, rating:4.7, reviews:64, badge:"SALE", tag:"sale" },
    { id:4, name:"Running Sports Shoes", cat:"sports", emoji:"👟", price:2299, oldPrice:3499, rating:4.6, reviews:210, badge:"HOT", tag:"sale" },
    { id:5, name:"Smartphone Stand Holder", cat:"electronics", emoji:"📱", price:349, oldPrice:599, rating:4.1, reviews:47, badge:"NEW", tag:"new" },
    { id:6, name:"Women's Ethnic Kurti", cat:"fashion", emoji:"👘", price:699, oldPrice:999, rating:4.4, reviews:92, badge:"", tag:"" },
    { id:7, name:"Yoga Mat Premium", cat:"sports", emoji:"🧘", price:799, oldPrice:1199, rating:4.8, reviews:176, badge:"SALE", tag:"sale" },
    { id:8, name:"Stainless Steel Water Bottle", cat:"home", emoji:"🍶", price:399, oldPrice:649, rating:4.3, reviews:55, badge:"NEW", tag:"new" },
  ];

  let cart = [];
  let displayProducts = [...products];
  let activeFilter = 'all';

  function renderProducts(list) {
    const grid = document.getElementById('productGrid');
    if (!list.length) { grid.innerHTML = '<p style="color:#888;grid-column:1/-1;text-align:center;padding:40px">No products found.</p>'; return; }
    grid.innerHTML = list.map(p => `
      <div class="product-card" data-cat="${p.cat}" data-tag="${p.tag}">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <button class="wishlist-btn" onclick="toggleWish(this)" title="Wishlist">🤍</button>
        <div class="product-img">${p.emoji}</div>
        <div class="product-info">
          <div class="product-category">${p.cat}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
            <span class="rating-count">(${p.reviews})</span>
          </div>
          <div class="product-footer">
            <div class="price-group">
              <span class="price">₹${p.price.toLocaleString()}</span>
              ${p.oldPrice ? `<span class="price-old">₹${p.oldPrice.toLocaleString()}</span>` : ''}
            </div>
            <button class="add-btn" onclick="addToCart(${p.id}, this)">Add +</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function filterCat(cat, el) {
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    displayProducts = cat === 'all' ? [...products] : products.filter(p => p.cat === cat);
    renderProducts(displayProducts);
  }

  function setFilter(tag, el) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    activeFilter = tag;
    const base = displayProducts.length ? displayProducts : [...products];
    renderProducts(tag === 'all' ? base : base.filter(p => p.tag === tag));
  }

  function sortProducts(val) {
    let list = [...displayProducts];
    if (val === 'low') list.sort((a,b) => a.price - b.price);
    else if (val === 'high') list.sort((a,b) => b.price - a.price);
    else if (val === 'rating') list.sort((a,b) => b.rating - a.rating);
    renderProducts(list);
  }

  function filterProducts(query) {
    const q = query.toLowerCase();
    renderProducts(q ? products.filter(p => p.name.toLowerCase().includes(q) || p.cat.includes(q)) : [...products]);
  }

  function addToCart(id, btn) {
    const p = products.find(x => x.id === id);
    const existing = cart.find(x => x.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...p, qty: 1 });
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Add +'; btn.classList.remove('added'); }, 1500);
    updateCart();
    showToast(`${p.emoji} ${p.name} added!`);
  }

  function updateCart() {
    const count = cart.reduce((s,i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = count;
    const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
    document.getElementById('subtotal').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('totalAmt').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('cartFooter').style.display = cart.length ? 'block' : 'none';

    const itemsEl = document.getElementById('cartItems');
    if (!cart.length) {
      itemsEl.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p></div>';
      return;
    }
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div class="cart-item-emoji">${i.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">₹${(i.price * i.qty).toLocaleString()}</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${i.id},-1)">−</button>
            <span class="qty-num">${i.qty}</span>
            <button class="qty-btn" onclick="changeQty(${i.id},1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeItem(${i.id})">🗑</button>
      </div>
    `).join('');
  }

  function changeQty(id, delta) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
    updateCart();
  }

  function removeItem(id) {
    cart = cart.filter(x => x.id !== id);
    updateCart();
  }

  function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
  }

  function toggleWish(btn) {
    btn.classList.toggle('liked');
    btn.textContent = btn.classList.contains('liked') ? '❤️' : '🤍';
  }

  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  function checkout() {
    if (!cart.length) return;
    const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
    const email = prompt(`Order total: ₹${total.toLocaleString()}.\nPlease enter your email address to confirm:`);
    if (email) {
      alert(`Order placed successfully!\nOur team will contact you shortly at ${email}.`);
      cart = [];
      updateCart();
      toggleCart();
    }
  }

  renderProducts(products);