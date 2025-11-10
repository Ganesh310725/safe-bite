import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, setDoc, doc,
  onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHGkMQNWkf9ercGpasUZZFhEyLtMlH-O8",
  authDomain: "safe-bite-25f79.firebaseapp.com",
  projectId: "safe-bite-25f79",
  storageBucket: "safe-bite-25f79.appspot.com",
  messagingSenderId: "892177818677",
  appId: "1:892177818677:web:4d6a683e3702d19f3cbd7c",
  measurementId: "G-6EJM88BCJG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let vendorList = [];
let editIndex = -1;

// Add ingredient field
function addIngredientField() {
  document.getElementById("ingredientsContainer").innerHTML += `
    <input type="text" placeholder="Ingredient" class="ingredient" />
    <input type="text" placeholder="Brand" class="brand" />
    <input type="date" class="expiry" />
  `;
}

// Add menu field
function addMenuField() {
  document.getElementById("menuContainer").innerHTML += `
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
  const shopPhotoInput = document.getElementById("shopPhoto");

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

  const reader1 = new FileReader();
  const reader2 = new FileReader();

  reader1.onload = () => {
    const oilPhoto = reader1.result;
    reader2.onload = async () => {
      const shopPhoto = reader2.result;

      const vendorData = {
        name,
        shopName,
        location,
        ingredients,
        menu,
        oilPhoto,
        shopPhoto,
        ratings: editIndex >= 0 ? vendorList[editIndex].ratings : [],
        timestamp: Date.now()
      };

      try {
        if (editIndex >= 0) {
          const vendor = vendorList[editIndex];
          const docRef = doc(db, "vendors", vendor.id);
          await setDoc(docRef, vendorData);
          editIndex = -1;
        } else {
          await addDoc(collection(db, "vendors"), vendorData);
        }
      } catch (err) {
        console.error("Error saving vendor:", err);
      }

      clearForm();
    };
    reader2.readAsDataURL(shopPhotoInput.files[0]);
  };

  if (oilPhotoInput.files.length && shopPhotoInput.files.length) {
    reader1.readAsDataURL(oilPhotoInput.files[0]);
  } else {
    alert("Please upload both shop and oil photos");
  }
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
  document.getElementById("shopPhoto").value = "";
}
// Display vendors
function displayVendors() {
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

        <p><strong>Shop Photo:</strong></p>
        <img src="${v.shopPhoto}" style="width:100%; max-width:600px; border-radius:10px; margin-bottom:1rem;" />

        <ul><strong>Ingredients:</strong> ${ingredientHTML}</ul>
        <ul><strong>Menu:</strong> ${menuHTML}</ul>

        <p><strong>Oil Change Photo:</strong></p>
        <img src="${v.oilPhoto}" style="width:100%; max-width:600px; border-radius:10px;" />

        <div class="rating" data-index="${index}">
          <span class="star" data-value="1">&#9733;</span>
          <span class="star" data-value="2">&#9733;</span>
          <span class="star" data-value="3">&#9733;</span>
          <span class="star" data-value="4">&#9733;</span>
          <span class="star" data-value="5">&#9733;</span>
          <p>Average Rating: ${avgRating}</p>
        </div>

        <button onclick="editVendor(${index})">✏️ Edit</button>
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
  document.getElementById("shopPhoto").value = "";
}

// Firestore sync
window.onload = function () {
  const q = query(collection(db, "vendors"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    vendorList = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      vendorList.push(data);
    });
    displayVendors();
  });
};

// Expose functions globally
window.addVendor = addVendor;
window.addIngredientField = addIngredientField;
window.addMenuField = addMenuField;
window.editVendor = editVendor;
