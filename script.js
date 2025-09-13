const productList = document.getElementById("product-list");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const categoryList = document.getElementById("categories");

let cart = [];
let hiddenProducts = []; 
let displayedCount = 9;

//  Loading Spinner
function showSpinner() {
  productList.innerHTML = `
    <div class="col-span-3 flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
    </div>
  `;
}

//  Fetch All Categories
async function fetchCategories() {
  try {
    const res = await fetch("https://openapi.programming-hero.com/api/categories");
    const data = await res.json();

    categoryList.innerHTML = "";

    // "All" button
    const allBtn = document.createElement("button");
    allBtn.textContent = "All Plants";
    allBtn.className = "bg-green-600 text-white px-3 py-1 rounded mb-2 w-full";
    allBtn.onclick = () => {
      setActiveButton(allBtn);
      fetchProducts();
    };
    categoryList.appendChild(allBtn);

    // Other categories from API
    data.categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat.category;
      btn.className = "px-3 py-1 rounded mb-2 w-full hover:bg-green-100";
      btn.onclick = () => {
        setActiveButton(btn);
        fetchProductsByCategory(cat.id);
      };
      categoryList.appendChild(btn);
    });

  } catch (err) {
    console.error("Error fetching categories:", err);
  }
}

//  Set active category button
function setActiveButton(btn) {
  document.querySelectorAll("#categories button").forEach(b => {
    b.classList.remove("bg-green-600", "text-white");
    b.classList.add("text-black");
  });
  btn.classList.add("bg-green-600", "text-white");
  btn.classList.remove("text-black");
}

//  Fetch All Plants
async function fetchProducts() {
  try {
    showSpinner();
    const res = await fetch("https://openapi.programming-hero.com/api/plants");
    const data = await res.json();
    renderProducts(data.plants);
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

//  Fetch Plants By Category
async function fetchProductsByCategory(id) {
  try {
    showSpinner();
    const res = await fetch(`https://openapi.programming-hero.com/api/category/${id}`);
    const data = await res.json();
    renderProducts(data.plants);
  } catch (err) {
    console.error("Error fetching category products:", err);
  }
}

//  Render Products with 9 initially + Load More
function renderProducts(plants) {
  productList.innerHTML = "";
  hiddenProducts = [];
  displayedCount = 6;

  // Split first 9 and rest
  const initial = plants.slice(0, displayedCount);
  hiddenProducts = plants.slice(displayedCount);

  initial.forEach(p => createCard(p));

  // Load More button
  if (hiddenProducts.length > 0) {
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.className = "bg-green-600 text-white px-4 py-2 rounded mt-4";
    loadMoreBtn.onclick = () => loadMoreProducts();
    productList.appendChild(loadMoreBtn);
  }
}

//  Create single card
function createCard(p) {
  const div = document.createElement("div");
  div.className = "bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition-all duration-200";
  
  div.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="h-32 w-full object-cover rounded mb-3 cursor-pointer" />
    <h3 class="font-semibold cursor-pointer">${p.name}</h3>
    <p class="text-sm text-gray-500">${p.description ? p.description.slice(0, 60) : 'No description'}...</p>
    <span class="inline-block mt-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700">${p.category}</span>
    <div class="flex justify-between items-center mt-3">
      <span class="font-semibold">৳${p.price}</span>
      <button class="bg-green-600 text-white px-3 py-1 rounded add-cart-btn">Add to Cart</button>
    </div>
  `;

  // Modal on click
  div.querySelector('h3').onclick = () => openModal(p);
  div.querySelector('img').onclick = () => openModal(p);

  // Add to cart
  div.querySelector('.add-cart-btn').onclick = () => addToCart(p);

  productList.appendChild(div);
}

//  Load more products
function loadMoreProducts() {
  const nextBatch = hiddenProducts.splice(0, displayedCount);
  nextBatch.forEach(p => createCard(p));

  // Remove Load More button if no more products
  if (hiddenProducts.length === 0) {
    const btn = document.querySelector("#product-list button");
    if (btn) btn.remove();
  }
}

//  Modal Function
function openModal(product) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full relative">
      <button id="closeModal" class="absolute top-2 right-2 text-red-500 text-xl font-bold">&times;</button>
      <img src="${product.image}" alt="${product.name}" class="h-40 w-full object-cover rounded mb-3" />
      <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
      <p class="text-gray-600 mb-2">${product.description || "No description available."}</p>
      <p class="font-semibold">Category: ${product.category}</p>
      <p class="font-semibold">Price: ৳${product.price}</p>
      <button class="bg-green-600 text-white px-3 py-1 rounded mt-3 w-full" id="modalAddCart">Add to Cart</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal
  modal.querySelector('#closeModal').onclick = () => modal.remove();

  // Add to cart from modal
  modal.querySelector('#modalAddCart').onclick = () => {
    addToCart(product);
    modal.remove();
  };
}

// Cart Functions
function addToCart(product) {
  const item = cart.find(c => c.id === product.id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-green-50 px-2 py-1 rounded";
    div.innerHTML = `
      <span>${item.name} ৳${item.price} × ${item.qty}</span>
      <button class="text-red-500 remove-cart-btn">×</button>
    `;
    div.querySelector(".remove-cart-btn").onclick = () => removeFromCart(item.id);
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = `৳${total}`;
}

// Initial Load
fetchCategories();
fetchProducts();
