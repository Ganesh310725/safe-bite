// Load vendors from localStorage
let vendorList = JSON.parse(localStorage.getItem("vendors")) || [];
let editIndex = -1;

// Add ingredient field dynamically
function addIngredientField() {
  const container = document.getElementById("ingredientsContainer");
  container.innerHTML += `
    <input type="text" placeholder="Ingredient" class="ingredient" />
    <input type="text" placeholder="Brand" class="brand" />
    <input type="date" class="expiry" />
  `;
}

// Add menu field dynamically
function addMenuField() {
  const container = document.getElementById("menuContainer");
  container.innerHTML += `
    <input type="text" placeholder="Menu Item" class="menuItem" />
    <input type="text" placeholder="Price" class="menuPrice" />
  `;
}

// Add or update vendor
function addVendor() {
  const name = document.getElementById("vendorName").value;
  const shopName = document.getElementById("shopName").value;
  const location = document.getElementById("location").value;
  const oilPhotoInput = document.getElementById("oilPhoto");

  const ingredientEls = document.querySelectorAll(".ingredient");
  const brandEls = document.querySelectorAll(".brand");
  const expiryEls = document.querySelectorAll(".expiry");

  const menuItemEls = document.querySelectorAll(".menuItem");
  const menuPriceEls = document.querySelectorAll(".menuPrice");

  // Collect ingredients
  const ingredients = [];
  for (let i = 0; i < ingredientEls.length; i++) {
    if (ingredientEls[i].value && brandEls[i].value && expiryEls[i].value) {
      ingredients.push({
        item: ingredientEls[i].value,
        brand: brandEls[i].value,
        expiry: expiryEls[i].value
      });
    }
  }

  // Collect menu
  const menu = [];
  for (let i = 0; i < menuItemEls.length; i++) {
    if (menuItemEls[i].value && menuPriceEls[i].value) {
      menu.push({
        item: menuItemEls[i].value,
        price: menuPriceEls[i].value
      });
    }
  }

  const updateVendor = (photo) => {
    const vendor = {
      name,
      shopName,
      location,
      ingredients,
      menu,
      oilPhoto: photo,
      ratings: editIndex >= 0 ? vendorList[editIndex].ratings : []
    };

    if (editIndex >= 0) {
      vendorList[editIndex] = vendor;
      editIndex = -1;
    } else {
      vendorList.push(vendor);
    }

    localStorage.setItem("vendors", JSON.stringify(vendorList));
    displayVendors();
    clearForm();
  };

  if (oilPhotoInput && oilPhotoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => updateVendor(reader.result);
    reader.readAsDataURL(oilPhotoInput.files[0]);
  } else {
    const existingPhoto = editIndex >= 0 ? vendorList[editIndex].oilPhoto : null;
    if (!existingPhoto) {
      alert("Please upload an oil photo");
      return;
    }
    updateVendor(existingPhoto);
  }
}

// Display vendors (Consumer View)
function displayVendors() {
  const container = document.getElementById("vendorList");
  if (!container) return;
  container.innerHTML = "";

  vendorList.forEach((v, index) => {
    const avgRating = v.ratings.length
      ? (v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length).toFixed(1)
      : "No ratings yet";

    let ingredientHTML = "";
    v.ingredients.forEach(i => {
      ingredientHTML += `<li>${i.item} – ${i.brand} (Expiry: ${i.expiry})</li>`;
    });

    let menuHTML = "";
    v.menu.forEach(m => {
      menuHTML += `<li>${m.item} – ₹${m.price}</li>`;
    });

    container.innerHTML += `
      <div class="card">
        <h3>${v.name}</h3>
        <p><strong>Shop:</strong> ${v.shopName}</p>
        <p><strong>Location:</strong> ${v.location}</p>
        <ul><strong>Ingredients:</strong> ${ingredientHTML}</ul>
        <ul><strong>Menu:</strong> ${menuHTML}</ul>
        <p><strong>Oil Change Photo:</strong></p>
        <img src="${v.oilPhoto}" width="100%" />
        <div class="rating" data-index="${index}">
          <span class="star" data-value="1">&#9733;</span>
          <span class="star" data-value="2">&#9733;</span>
          <span class="star" data-value="3">&#9733;</span>
          <span class="star" data-value="4">&#9733;</span>
          <span class="star" data-value="5">&#9733;</span>
          <p>Average Rating: ${avgRating}</p>
        </div>
        <button onclick="editVendor(${index})">✏️ Edit</button>
        <button onclick="deleteVendor(${index})">🗑️ Delete</button>
      </div>
    `;
  });

  document.querySelectorAll(".rating .star").forEach(star => {
    star.addEventListener("click", function () {
      const value = parseInt(this.getAttribute("data-value"));
      const index = this.parentElement.getAttribute("data-index");
      vendorList[index].ratings.push(value);
      localStorage.setItem("vendors", JSON.stringify(vendorList));
      displayVendors();
    });
  });
}

// Edit vendor
function editVendor(index) {
  const v = vendorList[index];
  editIndex = index;

  document.getElementById("vendorName").value = v.name;
  document.getElementById("shopName").value = v.shopName;
  document.getElementById("location").value = v.location;

  document.getElementById("ingredientsContainer").innerHTML = "";
  v.ingredients.forEach(i => {
    document.getElementById("ingredientsContainer").innerHTML += `
      <input type="text" class="ingredient" value="${i.item}" />
      <input type="text" class="brand" value="${i.brand}" />
      <input type="date" class="expiry" value="${i.expiry}" />
    `;
  });

  document.getElementById("menuContainer").innerHTML = "";
  v.menu.forEach(m => {
    document.getElementById("menuContainer").innerHTML += `
      <input type="text" class="menuItem" value="${m.item}" />
      <input type="text" class="menuPrice" value="${m.price}" />
    `;
  });

  document.getElementById("oilPhoto").value = "";
}

// Delete vendor
function deleteVendor(index) {
  vendorList.splice(index, 1);
  localStorage.setItem("vendors", JSON.stringify(vendorList));
  displayVendors();
}

// Clear form
function clearForm() {
  document.getElementById("vendorName").value = "";
  document.getElementById("shopName").value = "";
  document.getElementById("location").value = "";
  document.getElementById("ingredientsContainer").innerHTML = `
    <input type="text" placeholder="Ingredient" class="ingredient" />
    <input type="text" placeholder="Brand" class="brand" />
    <input type="date" class="expiry" />
  `;
  document.getElementById("menuContainer").innerHTML = `
    <input type="text" placeholder="Menu Item" class="menuItem" />
    <input type="text" placeholder="Price" class="menuPrice" />
  `;
  document.getElementById("oilPhoto").value = "";
}

// Auto-display vendors if on consumer page
window.onload = function () {
  displayVendors();
};