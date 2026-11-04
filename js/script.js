/* THE NAIL ART — premium storefront prototype.
 * Entirely client-side: no real inventory, orders, account auth or payment gateway.
 * Genuine product options and public price snapshots are kept in products.js.
 */
'use strict';

const $ = (selector, root=document) => root.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = amount => 'R' + Number(amount).toFixed(2);
const getProduct = id => STORE_PRODUCTS.find(item=>item.id===id);
const getCategory = id => STORE_CATEGORIES.find(cat=>cat[0]===id);
const readStore = (key,fallback) => { try {const val=JSON.parse(localStorage.getItem(key));return val??fallback;}catch{return fallback;} };
const ICONS = {
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 cart:'<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-7 8-7s8 3 8 7"/>',
 heart:'<path d="M20.5 4.9c-2.3-2.1-5.2-1.4-7 0.7L12 7.3l-1.5-1.7c-1.8-2.1-4.7-2.8-7-.7-3 2.8-1.8 6.9 1.2 9.6L12 21l7.3-6.5c3-2.7 4.2-6.8 1.2-9.6Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 truck:'<path d="M3 6h12v12H3zM15 10h4l3 4v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>'
};
const svg = (name,cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`;
const FAQ = [
 ['How much is shipping?','The original store FAQ lists a flat R120 delivery fee nationwide, except in some very remote areas. Confirm current costs when ordering.'],
 ['Can I collect my order?','The shop lists collection at Shop No. 10, Deco Park, Avant-Garde Avenue, Hoogland, Randburg, 2169.'],
 ['Do you ship internationally?','The original store says it does not ship outside South Africa. You can arrange your own courier to collect from the shop.'],
 ['When will my delivery arrive?','The original FAQ says processing usually takes one day once payment is received and delivery may take about 2–7 working days. Public home-page delivery estimates also vary by region.'],
 ['How do I track my order?','The original store sends courier and tracking details by email. A tracking number can take a few hours to activate after the courier collects the parcel.'],
 ['Can I add something to a completed order?','The original FAQ says orders cannot be changed after checkout. Contact the team immediately if you need assistance.'],
 ['How can I amend delivery details?','Contact sales@thenailart.co.za or WhatsApp 074 498 1814 quickly. Delivery changes after dispatch may carry extra costs.'],
 ['How are payments handled on the original shop?','The website instructs customers to use the order number as their payment reference and send proof of payment to payment@thenailart.co.za. Unpaid orders may be cancelled after three working days. This redesign does not take payments.']
];
const NAV_LINKS = [['','Home'],['shop','Shop All'],['new','New Arrivals'],['hot','What’s Hot'],['sale','Clearance'],['faq','FAQ'],['contact','Contact']];
const savedCart=readStore('nailart_cart_v2',null);
const state = {
 cart:Array.isArray(savedCart) ? savedCart.filter(i=>i&&getProduct(i.productId)&&i.qty>0) : [],
 wish:readStore('nailart_wish',[]),
 selectedOptions:{}, quantity:1, category:'', search:'', sort:'featured', page:1,
 maxPrice:'', mobile:false, showSearch:false, faqOpen:0, delivery:'ship',
 photoIndex:0, alert:''
};
// Upgrade shopping bags saved by the previous version. Variant-less products only.
if (!savedCart) {
 const legacy=readStore('nailart_cart',{});
 if (legacy && !Array.isArray(legacy)) for(const [oldId,qty] of Object.entries(legacy)) {
   const aliases={'ap019':'acrylic-set-a','ap040':'acrylic-set-4','sale002':'polish-set-sale','ap003':'powder-120','ap002':'powder-28','gel001':'hard-gel','gel002':'builder-gel','pol001':'top-coat','br001':'mermaid-brush','br002':'feather-brush','tip001':'dual-form','tip002':'ballerina-display','tip003':'colour-display','el001':'mini-lamp','liq001':'liquid-slip','set001':'gel-kit','tool001':'gem-picker'};
   const pid=aliases[oldId];if (pid && Number(qty)>0)state.cart.push({productId:pid,selection:{},qty:Math.min(99,Math.floor(Number(qty)))});
 }
}
function persist() {
 try {localStorage.setItem('nailart_cart_v2',JSON.stringify(state.cart));localStorage.setItem('nailart_wish',JSON.stringify(state.wish));}catch{}
}
function cartCount() {return state.cart.reduce((sum,item)=>sum+item.qty,0);}
function selectedOption(p,group,selection) {return p.options.find(g=>g.label===group)?.values.find(v=>v.label===selection?.[group]);}
function variantExtra(p,selection) {return p.options.reduce((sum,g)=>sum+(selectedOption(p,g.label,selection)?.extra || 0),0);}
function unitPrice(p,qty,selection) {
 // Known bulk tiers are applied to each distinct variant line, plus any variant price adjustment.
 return Math.max(0,(p.bulk && qty>=p.bulk.minimum ? p.bulk.unit:p.price) + variantExtra(p,selection));
}
function cartSubtotal() {return state.cart.reduce((sum,line)=>sum+unitPrice(getProduct(line.productId),line.qty,line.selection)*line.qty,0);}
function cartKey(productId,selection) {return productId+'::'+JSON.stringify(Object.keys(selection).sort().map(k=>[k,selection[k]]));}
function notice(message) {const existing=$('.toast');if(existing)existing.remove();const node=document.createElement('div');node.className='toast';node.setAttribute('role','status');node.textContent=message;document.body.appendChild(node);setTimeout(()=>node.remove(),3200);}
function routeInfo(){const raw=(location.hash||'#/').replace(/^#\/?/,'');const [path,params='']=raw.split('?');return {path:path||'',segments:(path||'').split('/'),params:new URLSearchParams(params)};}
const breadcrumb=items=>`<div class="breadcrumb"><a href="#/">Home</a>${items.map(([label,href])=>`<span>›</span>${href?`<a href="${href}">${escapeHTML(label)}</a>`:`<span>${escapeHTML(label)}</span>`}`).join('')}</div>`;
function header(route) {
 return `<div class="announcement">${svg('truck')} <span>THE NAIL ART · PROFESSIONAL NAIL ESSENTIALS ACROSS SOUTH AFRICA</span></div>
 <header class="header"><div class="container head-inner">
  <a class="brand" href="#/" aria-label="The Nail Art home"><img class="brand-logo" src="assets/branding/the-nail-art-logo.png" alt="Original The Nail Art logo" width="246" height="120"></a>
  <nav class="nav" aria-label="Main navigation">${NAV_LINKS.map(([path,text])=>`<a href="#/${path}" class="${route===path?'active':''}">${text}</a>`).join('')}</nav>
  <div class="header-actions"><button class="icon-btn" type="button" aria-label="Search products" data-action="toggle-search">${svg('search')}</button>
  <a class="icon-btn" href="#/account" aria-label="My account">${svg('user')}</a>
  <a class="icon-btn" href="#/favorites" aria-label="Favourites">${svg('heart')}${state.wish.length?`<span class="count">${state.wish.length}</span>`:''}</a>
  <a class="icon-btn" href="#/cart" aria-label="Shopping bag, ${cartCount()} items">${svg('cart')}${cartCount()?`<span class="count">${cartCount()}</span>`:''}</a>
  <button class="icon-btn mobile-menu" data-action="toggle-menu" aria-label="Menu" aria-expanded="${state.mobile}">${svg('menu')}</button></div></div>
  ${state.showSearch?`<form id="header-search" class="searchbar"><div class="container"><input name="search" type="search" value="${escapeHTML(state.search)}" placeholder="Search polish, tips, brushes..." aria-label="Search products"><button type="submit">Search</button></div></form>`:''}
  ${state.mobile?`<div class="mobile-nav">${NAV_LINKS.map(([path,text])=>`<a href="#/${path}">${text}</a>`).join('')}<a href="#/categories">All 11 categories</a><a href="#/account">My Account</a><a href="#/track">Track Orders</a><a href="#/terms">Terms & Returns</a></div>`:''}
 </header>`;
}
function footer() {
 return `<footer class="footer"><div class="container"><div class="footer-inner">
 <div><a href="#/" class="brand"><img class="brand-logo" src="assets/branding/the-nail-art-logo.png" alt="Original The Nail Art logo" loading="lazy"></a><p>Professional nail essentials, thoughtfully presented. A concept redesign of the original South African store.</p></div>
 <div class="footer-col"><h4>Shop</h4><a href="#/shop">All Products</a><a href="#/categories">Categories</a><a href="#/new">New Arrivals</a><a href="#/hot">What’s Hot</a><a href="#/sale">Clearance</a></div>
 <div class="footer-col"><h4>Help</h4><a href="#/faq">FAQs</a><a href="#/contact">Contact</a><a href="#/terms">T & C / Returns</a><a href="#/track">Track Orders</a><a href="#/account">My Account</a></div>
 <div class="footer-col"><h4>Visit or contact</h4><a href="mailto:info@thenailart.co.za">info@thenailart.co.za</a><a href="https://wa.me/27744981814" rel="noopener" target="_blank">WhatsApp · 074 498 1814</a><p>Shop 10, Deco Park, Randburg<br>Mon–Fri 08:30–16:30<br>Sat 09:00–14:00</p></div>
 </div><div class="footer-bottom"><span>© 2026 The Nail Art · Independent front-end concept</span><span>Prices in ZAR · Demo cart · Not a live checkout</span></div></div></footer>`;
}
function photo(p,kind='card') {
 if(p.image) return `<div class="product-photo"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><div class="photo-fallback" hidden><span class="abstract"></span><small>Original photo unavailable</small></div></div>`;
 const letter=getCategory(p.category)?.[3]||'✦';
 return `<div class="product-photo"><div class="photo-fallback" aria-label="Product photo not yet added"><span class="abstract ${p.category==='decor'?'sparkle-art':''}"></span><span class="fallback-letter">${escapeHTML(letter)}</span><small>Photo to be added</small></div></div>`;
}
function productCard(p) {
 const isWish=state.wish.includes(p.id);
 return `<article class="product-card"><a href="#/product/${p.id}" aria-label="View ${escapeHTML(p.name)}">${photo(p)}</a>
 ${p.status?`<span class="pill">${{new:'NEW',sale:'SALE',hot:'POPULAR'}[p.status]||''}</span>`:''}
 <button class="heart ${isWish?'active':''}" data-action="wish" data-id="${p.id}" aria-label="${isWish?'Remove':'Save'} ${escapeHTML(p.name)}">${isWish?'♥':'♡'}</button>
 <div class="product-body"><div class="product-label">${escapeHTML(getCategory(p.category)?.[1]||'Nail essentials')}</div>
 <a class="product-name" href="#/product/${p.id}">${escapeHTML(p.name)}</a>
 <div class="price-row"><span class="price">${money(p.price)}</span>${p.oldPrice?`<span class="was">${money(p.oldPrice)}</span>`:''}</div>
 ${p.options.length ? `<a class="add-btn" href="#/product/${p.id}">Choose options →</a>` : `<button class="add-btn" type="button" data-action="quick-add" data-id="${p.id}">＋ Add to bag</button>`}</div></article>`;
}
function categoryCards(limit) {
 return `<div class="category-grid">${STORE_CATEGORIES.slice(0,limit||11).map((cat,i)=>`<a href="#/shop?category=${cat[0]}" class="cat-card"><div class="cat-art" style="--catbg:${['#f7e9e5','#f3dfe2','#f4e6e4','#f6ece8','#f7e0e7','#f5e6dd'][i%6]}">${cat[0]==='powder'?`<img src="${SOURCE_IMAGES.acrylic}" alt="Original Nail Art acrylic powder photo" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="cat-symbol" hidden>A</span>`:cat[0]==='polish'?`<img src="${SOURCE_IMAGES.clearance}" alt="Original Nail Art gel polish photo" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="cat-symbol" hidden>G</span>`:`<span class="cat-symbol">${escapeHTML(cat[3])}</span>`}</div><div class="cat-label">${escapeHTML(cat[1])}</div><div class="cat-caption">${escapeHTML(cat[2])}</div></a>`).join('')}</div>`;
}
function productRow(title,label,items,href) {
 return `<section class="section"><div class="section-head"><div><span class="overline">${escapeHTML(label)}</span><h2>${escapeHTML(title)}</h2></div><a class="text-link" href="${href}">View all →</a></div><div class="product-grid">${items.slice(0,4).map(productCard).join('')}</div></section>`;
}
function homePage() {
 return `<main><div class="container"><section class="hero"><div class="hero-copy"><p class="overline">The beauty is in the details</p><h1>Your nail studio starts here.</h1><p>Every colour. Every tool. Every finishing touch. Discover nail essentials, beautifully organised.</p><a class="btn" href="#/shop">Shop the collection ${svg('arrow')}</a></div>
 <div class="hero-art"><span class="sparkle one">✳</span><span class="sparkle two">✧</span><img class="hero-photo" src="${SOURCE_IMAGES.acrylic}" alt="Original acrylic powder product photo"><img class="hero-photo hero-photo-small" src="${SOURCE_IMAGES.acrylic4}" alt="Original acrylic set product photo"></div></section>
 <div class="category-bar"><div class="section-head"><div><span class="overline">Discover your next manicure</span><h2>Shop by category</h2></div><a href="#/categories" class="text-link">All 11 categories →</a></div>${categoryCards(5)}</div>
 <section class="value-band"><div class="value-item"><span class="value-icon">✧</span><div><strong>Designed for nail artists</strong><p>Studio essentials, all in one place</p></div></div><div class="value-item"><span class="value-icon">♡</span><div><strong>Choose your style</strong><p>Select colours, sizes and product codes</p></div></div><div class="value-item"><span class="value-icon">↗</span><div><strong>Local South African store</strong><p>Randburg collection available</p></div></div></section>
 ${productRow('Made for your next set','Explore real product choices',[getProduct('uv-gel'),getProduct('soft-tips'),getProduct('sandalwood'),getProduct('rhinestones')],'#/shop')}
 <section class="highlight"><div class="highlight-copy"><span class="overline">Something special</span><h2>Small details. Beautiful results.</h2><p>From sculpting gels to art plates and finishing brushes, there's something to inspire every set.</p><a class="btn btn-dark" href="#/new">Explore new arrivals →</a></div><div class="highlight-art"><img src="${SOURCE_IMAGES.acrylic4}" alt="Original acrylic product image"></div></section>
 ${productRow('Latest finds','Fresh from the catalogue',STORE_PRODUCTS.filter(p=>p.status==='new'),'#/new')}
 <div class="help-banner"><div><h3>Need help choosing?</h3><p>Get delivery details, product guidance and ways to contact the original store.</p></div><a class="btn btn-outline" href="#/faq">Visit help centre →</a></div></div></main>`;
}
function categoriesPage() {
 return `<main class="page"><div class="container">${breadcrumb([['Categories']])}
 <div class="page-heading"><span class="overline">Explore every corner of the studio</span><h1>Shop by category.</h1><p>All eleven categories from The Nail Art's original online store.</p></div>${categoryCards()}</div></main>`;
}
function cataloguePage(type,params) {
 const selectedCategory=params.get('category')||'';
 let items=STORE_PRODUCTS.filter(p=>type==='shop'?(!selectedCategory||p.category===selectedCategory):p.status===({new:'new',hot:'hot',sale:'sale'}[type]));
 if(state.search.trim())items=items.filter(p=>(p.name+' '+p.sku+' '+(getCategory(p.category)?.[1]||'')).toLowerCase().includes(state.search.toLowerCase().trim()));
 if(state.maxPrice)items=items.filter(p=>p.price<=Number(state.maxPrice));
 switch(state.sort) {
  case 'price-asc':items.sort((a,b)=>a.price-b.price);break;
  case 'price-desc':items.sort((a,b)=>b.price-a.price);break;
  case 'name':items.sort((a,b)=>a.name.localeCompare(b.name));break;
  case 'new':items.sort((a,b)=>(b.status==='new')-(a.status==='new'));break;
 }
 const names={shop:'All nail essentials',new:'New arrivals',hot:'What’s hot',sale:'Clearance'};
 const title=selectedCategory ? getCategory(selectedCategory)?.[1]||'Products' : names[type];
 const pages=Math.max(1,Math.ceil(items.length/12));state.page=Math.max(1,Math.min(state.page,pages));
 const current=items.slice((state.page-1)*12,state.page*12);
 return `<main class="page"><div class="container">${breadcrumb([[title]])}
 <div class="page-heading"><span class="overline">THE NAIL ART · SHOP</span><h1>${escapeHTML(title)}</h1><p>Browse the collection and select the exact colour, size or code on each product page.</p></div>
 <div class="catalogue"><aside class="side-filter"><h4>Categories</h4><a href="#/shop" class="${!selectedCategory?'selected':''}">All Products</a>
 ${STORE_CATEGORIES.map(c=>`<a href="#/shop?category=${c[0]}" class="${selectedCategory===c[0]?'selected':''}">${escapeHTML(c[1])}</a>`).join('')}
 <div class="small-label">Collections</div><a href="#/new">New Arrivals</a><a href="#/hot">What's Hot</a><a href="#/sale">Clearance</a></aside>
 <div class="catalogue-results"><div class="mobile-categories"><label for="mobile-category">Category</label><select id="mobile-category"><option value="">All product categories</option>${STORE_CATEGORIES.map(c=>`<option value="${c[0]}" ${selectedCategory===c[0]?'selected':''}>${escapeHTML(c[1])}</option>`).join('')}</select></div>
 <div class="filter-toolbar"><div class="filter-top"><span>${items.length} products <small>· curated sample</small></span><button type="button" class="text-link" data-action="clear-filters">Clear filters</button></div>
 <div class="filter-fields"><label>Search <input id="catalogue-search" type="search" value="${escapeHTML(state.search)}" placeholder="Name or SKU"></label>
 <label>Max price <select id="max-price"><option value="">Any price</option>${[25,50,100,200,500,1000].map(n=>`<option value="${n}" ${state.maxPrice===String(n)?'selected':''}>Under ${money(n)}</option>`).join('')}</select></label>
 <label>Sort by <select id="sort"><option value="featured" ${state.sort==='featured'?'selected':''}>Featured</option><option value="price-asc" ${state.sort==='price-asc'?'selected':''}>Price: low to high</option><option value="price-desc" ${state.sort==='price-desc'?'selected':''}>Price: high to low</option><option value="name" ${state.sort==='name'?'selected':''}>Name: A–Z</option><option value="new" ${state.sort==='new'?'selected':''}>New arrivals</option></select></label></div></div>
 ${current.length?`<div class="product-grid">${current.map(productCard).join('')}</div>`:`<div class="empty"><h3>No matches found.</h3><p>Change the search, category or price filter to see more.</p><button class="btn" data-action="clear-filters">Reset filters</button></div>`}
 ${pages>1?`<div class="result-pager"><button data-action="prev-page" ${state.page===1?'disabled':''} aria-label="Previous page">‹</button>${Array.from({length:pages},(_,i)=>`<button data-action="page" data-page="${i+1}" class="${state.page===i+1?'active':''}" aria-label="Page ${i+1}">${i+1}</button>`).join('')}<button data-action="next-page" ${state.page===pages?'disabled':''} aria-label="Next page">›</button></div>`:''}
 <p class="page-note">Public product snapshots, not the complete live inventory. Prices, stock and option availability must be checked on the original store.</p></div></div></div></main>`;
}
function optionFields(p) {
 if(!p.options.length)return '<p class="choice-note">No colour or size choices are listed for this product in this preview.</p>';
 const chosen=state.selectedOptions[p.id]||{};
 return `<div class="option-fields">${p.options.map((group,index)=>`<div class="variant-field"><label for="variant-${index}">${escapeHTML(group.label)} <span class="required-star">*</span></label>
 <select id="variant-${index}" class="variant-select" data-group="${escapeHTML(group.label)}" aria-required="true" required>
 <option value="">Select ${escapeHTML(group.label.toLowerCase())}</option>${group.values.map(value=>`<option value="${escapeHTML(value.label)}" ${chosen[group.label]===value.label?'selected':''}>${escapeHTML(value.label)}${value.extra>0?' (+'+money(value.extra)+')':value.extra<0?' ('+money(value.extra)+')':''}</option>`).join('')}</select></div>`).join('')}</div>`;
}
function detailPage(id) {
 const p=getProduct(id);
 if(!p)return `<main class="page"><div class="container"><div class="empty"><h2>Product not found</h2><a class="btn" href="#/shop">Back to shop</a></div></div></main>`;
 const selection=state.selectedOptions[p.id]||{};
 const chosenComplete=p.options.every(group=>selectedOption(p,group.label,selection));
 const nowPrice=unitPrice(p,state.quantity,selection);
 const bulkActive=!!p.bulk && state.quantity>=p.bulk.minimum;
 const priceTotal=nowPrice*state.quantity;
 const alike=STORE_PRODUCTS.filter(other=>other.category===p.category&&other.id!==p.id).slice(0,4);
 return `<main class="page"><div class="container">${breadcrumb([['Shop','#/shop'],[getCategory(p.category)?.[1]||'Category','#/shop?category='+p.category],[p.name]])}
 <div class="detail"><div class="detail-image-column"><div class="detail-img">${photo(p,'detail')}</div><div class="photo-caption">${p.image?'Original product image from the shop':'A product photo can be added here from the owner’s catalogue'}</div></div>
 <div class="detail-info"><span class="overline">${escapeHTML(getCategory(p.category)?.[1]||'Nail essentials')}</span><h1>${escapeHTML(p.name)}</h1>
 <div class="detail-price"><span id="unit-price">${money(nowPrice)}</span>${p.oldPrice?`<span class="was">${money(p.oldPrice)}</span>`:''}</div>
 ${p.sku?`<p class="small-muted">SKU: ${escapeHTML(p.sku)}</p>`:''}
 <p class="stock-note">Stock shown on original listing · <strong>Live availability not connected</strong></p>
 <p class="detail-text">${escapeHTML(p.description||'Discover this nail studio essential from The Nail Art catalogue. See the original listing for complete product specifications and availability.')}</p>
 ${optionFields(p)}
 <div class="quantity-line"><label for="detail-qty">Quantity</label><div class="qty"><button type="button" aria-label="Decrease quantity" data-action="detail-qty-down">−</button><input id="detail-qty" type="number" min="1" max="99" step="1" value="${state.quantity}" inputmode="numeric" aria-label="Quantity"><button type="button" aria-label="Increase quantity" data-action="detail-qty-up">+</button></div></div>
 ${p.bulk?`<div class="bulk-panel ${bulkActive?'bulk-active':''}"><strong>Buy more, save more</strong><div><span>${p.bulk.minimum}+ of the same option</span><strong>${money(p.bulk.unit)} / item*</strong></div><small>*Base bulk rate from the public listing. Any colour/size price adjustment is added to this rate. Confirm final pricing with the store.</small></div>`:''}
 <div class="selection-total"><span>Estimated total for ${state.quantity} item${state.quantity!==1?'s':''}</span><strong>${money(priceTotal)}</strong></div>
 ${p.options.length&&!chosenComplete?'<p class="validation-note">Choose a required option to add this product to your bag.</p>':''}
 <div class="detail-buttons"><button type="button" class="btn" data-action="add-product" data-mode="stay" data-id="${p.id}">Add to bag ${svg('cart')}</button>
 <button type="button" class="btn btn-outline" data-action="add-product" data-mode="again" data-id="${p.id}">Add more options</button></div>
 <div class="secondary-actions"><button type="button" class="text-link" data-action="add-product" data-mode="checkout" data-id="${p.id}">Go to checkout preview →</button>
 <button type="button" class="text-link" data-action="wish" data-id="${p.id}">${state.wish.includes(p.id)?'♥ Saved to favourites':'♡ Save to favourites'}</button></div>
 ${p.url?`<a class="original-link" href="${escapeHTML(p.url)}" target="_blank" rel="noopener">Open this product on the original website ↗</a>`:`<a class="original-link" href="${STORE_URL}/online-store" target="_blank" rel="noopener">Check availability on the original website ↗</a>`}
 <p class="form-note">This is a demo basket. Adding items here does not reserve stock or place a real order.</p>
 <div class="details-accordion"><details open><summary>Product details</summary><p>${escapeHTML(p.description||p.name)}</p>${p.sku?`<p>Product SKU: ${escapeHTML(p.sku)}</p>`:''}</details>
 <details><summary>Delivery & collection</summary><p>Original FAQ lists R120 shipping nationwide, with some remote-area exceptions. Local collection is available in Randburg. Confirm before ordering.</p></details>
 <details><summary>Returns & care</summary><p>Original T & C: unused items can be returned within 14 days of receipt. See the full terms for conditions and exclusions.</p></details></div></div></div>
 ${alike.length?productRow('You may also like','Continue exploring',alike,'#/shop?category='+p.category):''}</div></main>`;
}
function selectionDescription(selection){return Object.entries(selection||{}).map(([k,v])=>`${k}: ${v}`).join(' · ');}
function cartPage() {
 const subtotal=cartSubtotal();
 return `<main class="page"><div class="container">${breadcrumb([['Shopping bag']])}<div class="page-heading"><span class="overline">THE NAIL ART · YOUR PICKS</span><h1>Shopping bag (${cartCount()})</h1><p>Colours, sizes and codes stay separate—just as you selected them.</p></div>
 ${state.cart.length?`<div class="cart-layout"><div><div class="cart-list">${state.cart.map((line,index)=>{
 const p=getProduct(line.productId),perItem=unitPrice(p,line.qty,line.selection);
 return `<article class="cart-row"><a href="#/product/${p.id}">${photo(p)}</a><div class="cart-details"><a href="#/product/${p.id}" class="product-name">${escapeHTML(p.name)}</a>
 ${selectionDescription(line.selection)?`<p class="cart-selection">${escapeHTML(selectionDescription(line.selection))}</p>`:''}
 <p class="small-muted">${money(perItem)} each ${p.bulk&&line.qty>=p.bulk.minimum?'· bulk rate':''}</p><strong class="price">${money(perItem*line.qty)}</strong></div>
 <div class="qty"><button data-action="cart-minus" data-index="${index}" aria-label="Reduce ${escapeHTML(p.name)}">−</button><span>${line.qty}</span><button data-action="cart-plus" data-index="${index}" aria-label="Increase ${escapeHTML(p.name)}">+</button></div>
 <button class="trash" data-action="remove-line" data-index="${index}">Remove</button></article>`;}).join('')}</div><a href="#/shop" class="text-link" style="display:inline-block;margin-top:23px">← Continue shopping</a></div>
 <aside class="summary"><h3>Bag summary</h3><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Delivery (estimated)</span><strong>${money(SHIPPING_ZAR)}</strong></div><div class="summary-line summary-total"><span>Estimated total</span><strong>${money(subtotal+SHIPPING_ZAR)}</strong></div>
 <a class="btn" href="#/checkout">Continue to checkout preview →</a><button class="btn btn-outline summary-share" data-action="share-bag">Share shopping list via WhatsApp</button>
 <p class="form-note">No payment is taken. WhatsApp shares your selected items for an availability enquiry; it is not an order submission.</p></aside></div>`:
 `<div class="empty"><h3>Your shopping bag is empty.</h3><p>Find your next favourite and choose your preferred colour, size or code.</p><a href="#/shop" class="btn">Start shopping →</a></div>`}</div></main>`;
}
function orderListText() {
 return 'Hello The Nail Art, could you please confirm availability and current prices for these items?\n\n'+state.cart.map(line=>{
 const p=getProduct(line.productId);
 return `${line.qty} × ${p.name}${selectionDescription(line.selection)?' ('+selectionDescription(line.selection)+')':''}`;
 }).join('\n')+'\n\nThis is an enquiry, not a placed order. Thank you!';
}
function checkoutPage() {
 const delivery=state.delivery==='ship'?SHIPPING_ZAR:0;
 const subtotal=cartSubtotal();
 return `<main class="page"><div class="container">${breadcrumb([['Bag','#/cart'],['Checkout preview']])}<div class="page-heading"><span class="overline">Order experience · demo</span><h1>Checkout preview.</h1><p>Preview your delivery choices and order summary. No orders or payments are processed here.</p></div>
 ${state.cart.length?`<div class="checkout-layout"><div><div class="notice" style="margin-bottom:20px"><strong>Demo checkout only.</strong> To purchase, you must use the original website. This preview cannot carry your bag into the original shop.</div>
 <div class="form-card"><h3>Delivery or collection</h3><div class="delivery-choices"><label><input type="radio" name="delivery" value="ship" ${state.delivery==='ship'?'checked':''}><span><strong>Courier delivery</strong><small>Estimated ${money(SHIPPING_ZAR)} nationwide (some remote areas excluded)</small></span></label>
 <label><input type="radio" name="delivery" value="collect" ${state.delivery==='collect'?'checked':''}><span><strong>Collect in Randburg</strong><small>Shop 10, Deco Park, Avant-Garde Avenue</small></span></label></div>
 <h3 style="margin-top:25px">Contact details (preview)</h3><div class="form-grid"><div class="field"><label>First name<input type="text" placeholder="First name" autocomplete="off"></label></div><div class="field"><label>Last name<input type="text" placeholder="Last name" autocomplete="off"></label></div></div>
 <div class="field"><label>Email<input type="email" placeholder="you@example.com" autocomplete="off"></label></div>
 ${state.delivery==='ship'?`<div class="field"><label>Delivery address<input type="text" placeholder="Street address" autocomplete="off"></label></div><div class="form-grid"><div class="field"><label>City<input type="text" placeholder="City" autocomplete="off"></label></div><div class="field"><label>Postal code<input type="text" placeholder="Postal code" autocomplete="off"></label></div></div>`:
 '<div class="notice">Collection point: Shop 10, Deco Park, Avant-Garde Avenue, Hoogland, Randburg, 2169. Confirm opening times before travelling.</div>'}
 <p class="form-note">The form is non-functional and its contents are never sent or stored. Real orders require a connected commerce backend.</p></div></div>
 <aside class="summary"><h3>Order summary</h3>${state.cart.map(line=>{const p=getProduct(line.productId);return `<div class="summary-line"><span>${line.qty} × ${escapeHTML(p.name)}<small>${escapeHTML(selectionDescription(line.selection))}</small></span><strong>${money(unitPrice(p,line.qty,line.selection)*line.qty)}</strong></div>`;}).join('')}
 <div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>${state.delivery==='ship'?'Delivery (estimated)':'Collection'}</span><strong>${money(delivery)}</strong></div>
 <div class="summary-line summary-total"><span>Total estimate</span><strong>${money(subtotal+delivery)}</strong></div>
 <button class="btn" data-action="share-bag">Send product enquiry via WhatsApp</button>
 <a class="btn btn-outline summary-share" href="${STORE_URL}/online-store" target="_blank" rel="noopener">Shop on the original website ↗</a>
 <p class="form-note">Payment instructions on the original site use your order number as the bank-transfer reference. Do not send payment for this demo basket.</p></aside></div>`:
 `<div class="empty"><h3>No items to review.</h3><p>Add something to your shopping bag first.</p><a class="btn" href="#/shop">Shop products →</a></div>`}</div></main>`;
}
function favoritesPage() {
 const products=STORE_PRODUCTS.filter(p=>state.wish.includes(p.id));
 return `<main class="page"><div class="container">${breadcrumb([['Favourites']])}<div class="page-heading"><span class="overline">Keep close</span><h1>Favourites.</h1><p>Save products so you can find them again in this browser.</p></div>
 ${products.length?`<div class="product-grid">${products.map(productCard).join('')}</div>`:`<div class="empty"><h3>Nothing saved yet.</h3><p>Tap the heart on a product to save it for later.</p><a class="btn" href="#/shop">Explore the shop →</a></div>`}</div></main>`;
}
function faqPage() {
 return `<main class="page"><div class="container">${breadcrumb([['Frequently Asked Questions']])}<div class="page-heading"><span class="overline">We’re here to help</span><h1>Frequently asked questions.</h1><p>Delivery, collection, returns and order information from the original store.</p></div>
 <div class="faq-list">${FAQ.map(([q,a],index)=>`<div class="faq-item"><button class="faq-trigger" data-action="faq" data-index="${index}" aria-expanded="${state.faqOpen===index}">${escapeHTML(q)}<span>${state.faqOpen===index?'−':'+'}</span></button>${state.faqOpen===index?`<div class="faq-answer">${escapeHTML(a)}</div>`:''}</div>`).join('')}</div>
 <div class="help-banner"><div><h3>Still have a question?</h3><p>Reach out to the team directly.</p></div><a class="btn btn-outline" href="#/contact">Contact the store →</a></div></div></main>`;
}
function termsPage() {
 return `<main class="page"><div class="container">${breadcrumb([['Terms & Conditions']])}<div class="page-heading"><span class="overline">Shop with confidence</span><h1>Terms & returns.</h1><p>A simplified presentation of the original store's publicly displayed terms. The original policy takes precedence.</p></div>
 <div class="terms"><h3>Returns & exchanges</h3><p>The store states that unused products can be returned or exchanged within 14 days of receipt. Return packages must be prepaid; cash on delivery parcels are not accepted.</p>
 <h3>Returning an item</h3><ul><li>Write the order number on the outside of the parcel.</li><li>Include a note stating the order number and reason for return.</li><li>Refunds are described as being made within three working days of receiving the package.</li><li>Shipping is refunded only for a wrong item or an item defective on arrival.</li></ul>
 <h3>Damaged or missing items</h3><p>Contact the shop on the same day you open your parcel and provide photos by WhatsApp: 074 498 1814.</p>
 <h3>Electrical items</h3><p>The original terms state a three-month warranty on electrical items.</p>
 <h3>Returns address</h3><p>The Nail Art · Shop 10, Deco Park, Avant-Garde Avenue, Hoogland, Randburg, 2169.</p>
 <div class="notice"><a href="${STORE_URL}/terms" target="_blank" rel="noopener"><strong>Read the original legal terms ↗</strong></a> before any actual purchase.</div></div></div></main>`;
}
function contactPage() {
 return `<main class="page"><div class="container">${breadcrumb([['Contact']])}<div class="page-heading"><span class="overline">We’d love to hear from you</span><h1>Contact The Nail Art.</h1><p>Questions about products, orders or an upcoming manicure? Reach the original store directly.</p></div>
 <div class="contact-layout"><div class="form-card"><h3>Write an enquiry</h3><form id="contact-form"><div class="form-grid"><div class="field"><label for="contact-name">Name *</label><input id="contact-name" required name="name" placeholder="Your name"></div><div class="field"><label for="contact-email">Email *</label><input id="contact-email" type="email" required name="email" placeholder="Your email"></div></div>
 <div class="form-grid"><div class="field"><label for="contact-phone">Phone</label><input id="contact-phone" name="phone" placeholder="Your number"></div><div class="field"><label for="contact-order">Order number</label><input id="contact-order" name="order" placeholder="If applicable"></div></div>
 <div class="field"><label for="contact-message">Message *</label><textarea id="contact-message" name="message" placeholder="How can we help?" required></textarea></div>
 <button class="btn" type="submit">Write email →</button><p class="form-note">This opens your email app. It does not automatically send the message.</p></form></div>
 <div class="contact-details"><h3>Find us</h3><div class="info-group"><strong>WhatsApp</strong><p><a href="https://wa.me/27744981814" target="_blank" rel="noopener">074 498 1814 ↗</a></p></div>
 <div class="info-group"><strong>Email</strong><p><a href="mailto:info@thenailart.co.za">info@thenailart.co.za</a></p></div>
 <div class="info-group"><strong>Visit the shop</strong><p>Shop No. 10, Avant-Garde Avenue<br>Deco Park, Hoogland, Randburg<br>2169, South Africa</p><a href="https://www.google.com/maps/search/?api=1&query=Deco+Park+Avant-Garde+Avenue+Randburg" target="_blank" rel="noopener">View map ↗</a></div>
 <div class="info-group"><strong>Trading hours</strong><p>Monday–Friday: 08:30–16:30<br>Saturday: 09:00–14:00<br>Closed on Sundays & public holidays</p></div></div></div></div></main>`;
}
function accountPage() {
 return `<main class="page"><div class="container">${breadcrumb([['My Account']])}<div class="page-heading center-heading"><span class="overline">Your personal studio</span><h1>My account.</h1><p>Manage your genuine customer account on the original store.</p></div>
 <div class="account-panel"><div class="form-card"><h3>Account access</h3><p>Real sign-in, registration, saved addresses, and order history need the original store's customer system. This front-end prototype cannot access your account.</p>
 <a href="${STORE_URL}/online-store" class="btn" target="_blank" rel="noopener">Open original store account ↗</a>
 <div class="account-shortcuts"><a href="#/favorites">♡ Favourites in this preview</a><a href="#/track">↗ Track an existing order</a></div></div></div></div></main>`;
}
function trackPage() {
 return `<main class="page"><div class="container">${breadcrumb([['Track Orders']])}<div class="page-heading"><span class="overline">Updates & deliveries</span><h1>Track an order.</h1><p>Use the tracking reference sent by the store, or contact the team for assistance.</p></div>
 <div class="account-panel"><div class="form-card"><h3>Already ordered?</h3><p>Orders placed on the original site cannot be tracked from this redesign preview.</p>
 <a class="btn" href="${STORE_URL}/online-store" target="_blank" rel="noopener">Open original store ↗</a>
 <a class="btn btn-outline summary-share" href="https://wa.me/27744981814?text=Hello%20The%20Nail%20Art%2C%20please%20help%20me%20track%20my%20order." target="_blank" rel="noopener">Ask via WhatsApp ↗</a></div></div></div></main>`;
}
function render() {
 const r=routeInfo();let main='';
 if(r.path==='')main=homePage();
 else if(r.path==='categories')main=categoriesPage();
 else if(['shop','new','hot','sale'].includes(r.path))main=cataloguePage(r.path,r.params);
 else if(r.segments[0]==='product')main=detailPage(r.segments[1]);
 else if(r.path==='cart')main=cartPage();
 else if(r.path==='checkout')main=checkoutPage();
 else if(r.path==='favorites')main=favoritesPage();
 else if(r.path==='faq')main=faqPage();
 else if(r.path==='terms')main=termsPage();
 else if(r.path==='contact')main=contactPage();
 else if(r.path==='account')main=accountPage();
 else if(r.path==='track')main=trackPage();
 else main=categoriesPage();
 $('#app').innerHTML=header(r.path)+main+footer();
 document.title=(r.segments[0]==='product'?getProduct(r.segments[1])?.name||'Product':r.path?r.path[0].toUpperCase()+r.path.slice(1):'Home')+' | The Nail Art';
}
function requireSelection(p) {
 const chosen=state.selectedOptions[p.id]||{};
 const missing=p.options.filter(group=>!selectedOption(p,group.label,chosen));
 if(missing.length) {
  notice('Please choose '+missing.map(group=>group.label.toLowerCase()).join(' and ')+' first.');
  $('.variant-select')?.focus();return null;
 }
 return {...chosen};
}
function addSelection(p,mode='stay') {
 const selection=requireSelection(p);if(!selection)return;
 const qty=Math.max(1,Math.min(99,state.quantity));
 const key=cartKey(p.id,selection);
 const existing=state.cart.find(line=>cartKey(line.productId,line.selection)===key);
 if(existing)existing.qty=Math.min(99,existing.qty+qty);
 else state.cart.push({productId:p.id,selection,qty});
 persist();
 if(mode==='again') {state.selectedOptions[p.id]={};state.quantity=1;render();notice('Added to bag. Choose another option.');return;}
 if(mode==='checkout'){location.hash='#/checkout';return;}
 render();notice(qty+' item'+(qty>1?'s':'')+' added to your demo bag');
}
function changeCartQty(index,change) {
 const line=state.cart[index];if(!line)return;
 line.qty=Math.max(0,Math.min(99,line.qty+change));
 if(line.qty===0)state.cart.splice(index,1);
 persist();render();
}
function setFilter(key,value) {state[key]=value;state.page=1;render();}
function onAction(el) {
 const action=el.dataset.action;
 const id=el.dataset.id;
 switch(action) {
  case 'toggle-menu':state.mobile=!state.mobile;render();break;
  case 'toggle-search':state.showSearch=!state.showSearch;render();if(state.showSearch)$('#header-search input')?.focus();break;
  case 'wish': {
   state.wish=state.wish.includes(id)?state.wish.filter(x=>x!==id):[...state.wish,id];persist();render();notice(state.wish.includes(id)?'Saved to favourites':'Removed from favourites');break;
  }
  case 'quick-add': {
   const p=getProduct(id);if(!p||p.options.length){location.hash='#/product/'+id;break;}
   const key=cartKey(id,{}),existing=state.cart.find(line=>cartKey(line.productId,line.selection)===key);
   if(existing)existing.qty=Math.min(99,existing.qty+1);
   else state.cart.push({productId:id,selection:{},qty:1});
   persist();render();notice('Added to your demo shopping bag');break;
  }
  case 'detail-qty-up':state.quantity=Math.min(99,state.quantity+1);render();break;
  case 'detail-qty-down':state.quantity=Math.max(1,state.quantity-1);render();break;
  case 'add-product':{const p=getProduct(id);if(p)addSelection(p,el.dataset.mode);break;}
  case 'cart-plus':changeCartQty(Number(el.dataset.index),1);break;
  case 'cart-minus':changeCartQty(Number(el.dataset.index),-1);break;
  case 'remove-line':state.cart.splice(Number(el.dataset.index),1);persist();render();notice('Removed from your shopping bag');break;
  case 'faq':state.faqOpen=state.faqOpen===Number(el.dataset.index)?-1:Number(el.dataset.index);render();break;
  case 'clear-filters':state.search='';state.maxPrice='';state.sort='featured';state.page=1;render();break;
  case 'page':state.page=Number(el.dataset.page);render();window.scrollTo({top:0,behavior:'smooth'});break;
  case 'prev-page':state.page=Math.max(1,state.page-1);render();window.scrollTo({top:0,behavior:'smooth'});break;
  case 'next-page':state.page+=1;render();window.scrollTo({top:0,behavior:'smooth'});break;
  case 'share-bag': {
    if(!state.cart.length){notice('Add something to your bag first');break;}
    window.open('https://wa.me/27744981814?text='+encodeURIComponent(orderListText()),'_blank','noopener');break;
  }
 }
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-action]');
 if(!trigger)return;
 event.preventDefault();onAction(trigger);
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.matches('.variant-select')) {
  const r=routeInfo(),p=getProduct(r.segments[1]);if(!p)return;
  state.selectedOptions[p.id] ||= {};
  if(el.value)state.selectedOptions[p.id][el.dataset.group]=el.value;
  else delete state.selectedOptions[p.id][el.dataset.group];
  render();
 } else if(el.id==='detail-qty') {
  state.quantity=Math.max(1,Math.min(99,Math.floor(Number(el.value)||1)));render();
 } else if(el.id==='sort')setFilter('sort',el.value);
 else if(el.id==='max-price')setFilter('maxPrice',el.value);
 else if(el.id==='mobile-category') {location.hash='#/shop'+(el.value?'?category='+encodeURIComponent(el.value):'');}
 else if(el.name==='delivery') {state.delivery=el.value;render();}
 else if(el.id==='catalogue-search')setFilter('search',el.value);
});
document.addEventListener('keydown',event=>{
 if(event.key==='Enter'&&event.target.id==='catalogue-search') {event.preventDefault();setFilter('search',event.target.value);}
});
document.addEventListener('submit',event=>{
 if(event.target.id==='header-search') {
  event.preventDefault();state.search=new FormData(event.target).get('search')?.toString()||'';state.showSearch=false;state.page=1;
  if(routeInfo().path!=='shop')location.hash='#/shop';else render();return;
 }
 if(event.target.id==='contact-form') {
  event.preventDefault();
  const form=new FormData(event.target);
  const subject=encodeURIComponent('The Nail Art enquiry'+(form.get('order')?' - Order '+form.get('order'):''));
  const message=encodeURIComponent(`Name: ${form.get('name')}\nEmail: ${form.get('email')}\nPhone: ${form.get('phone')}\nOrder: ${form.get('order')}\n\n${form.get('message')}`);
  location.href='mailto:info@thenailart.co.za?subject='+subject+'&body='+message;
  notice('Your email app will open with your enquiry.');
 }
});
window.addEventListener('hashchange',()=>{
 state.page=1;state.quantity=1;state.mobile=false;state.selectedOptions={};render();window.scrollTo(0,0);
});
persist();
render();
