// -------------------- Firebase Setup --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } 
  from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "safe-bite-25f79.firebaseapp.com",
  projectId: "safe-bite-25f79",
  storageBucket: "safe-bite-25f79.appspot.com",
  messagingSenderId: "892177818677",
  appId: "1:892177818677:web:4d6a683e3702d19f3cbd7c",
  measurementId: "G-6EJM88BCJG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------- Local State --------------------
let vendorList = [];
let editIndex = -1;

// -------------------- Dynamic Field Functions --------------------
export function addIngredientField() {
  document.getElementById("ingredientsContainer").innerHTML += `
    <input type="text" placeholder="Ingredient" class="ingredient" />
    <input type="text" placeholder="Brand" class="brand" />
    <input type="date" class="expiry" />
  `;
}

export function addMenuField() {
  document.getElementById("menuContainer").innerHTML += `
    <input type="text" placeholder="Menu Item" class="menuItem" />
    <input type="text" placeholder="Price" class="menuPrice" />
  `;
}

// -------------------- Add or Update Vendor --------------------
export function addVendor() {
  const name = document.getElementById("vendorName").value;
  const shopName = document.getElementById("shopName").value;
  const location = document.getElementById("location").value;
  const oilPhotoInput = document.getElementById("oilPhoto");

  const ingredientEls = document.querySelectorAll(".ingredient");
  const brandEls = document.querySelectorAll(".brand");
  const expiryEls = document.querySelectorAll(".expiry");

  const menuItemEls = document.querySelectorAll(".menuItem");
  const menuPriceEls = document.querySelectorAll(".menuPrice");

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

  const menu = [];
  for (let i = 0; i < menuItemEls.length; i++) {
    if (menuItemEls[i].value && menuPriceEls[i].value) {
      menu.push({
        item: menuItemEls[i].value,
        price: menuPriceEls[i].value
      });
    }
  }

  const updateVendor = async (photo) => {
    const vendor = {
      name,
      shopName,
      location,
      ingredients,
      menu,
      oilPhoto: photo,
      ratings: [],
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, "vendors"), vendor);
      console.log("Vendor added to Firestore");
    } catch (err) {
      console.error("Error adding vendor:", err);
    }

    clearForm();
  };

  if (oilPhotoInput && oilPhotoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => updateVendor(reader.result);
    reader.readAsDataURL(oilPhotoInput.files[0]);
  } else {
    alert("Please upload an oil photo");
  }
}

// -------------------- Display Vendors --------------------
export function displayVendors() {
  const container = document.getElementById("vendorList");
  if (!container) return;
  container.innerHTML = "";

  vendorList.forEach((v, index) => {
    const avgRating = v.ratings?.length
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
      </div>
    `;
  });

  document.querySelectorAll(".rating .star").forEach(star => {
    star.addEventListener("click", function () {
      const value = parseInt(this.getAttribute("data-value"));
      const index = this.parentElement.getAttribute("data-index");
      vendorList[index].ratings.push(value);
      displayVendors();
    });
  });
}

// -------------------- Clear Form --------------------
export function clearForm() {
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

// -------------------- Firestore Sync --------------------
window.onload = function () {
  const q = query(collection(db, "vendors"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    vendorList = [];
    snapshot.forEach(doc => {
      vendorList.push(doc.data());
    });
    displayVendors();
  });
};
