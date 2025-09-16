// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDkqd_6qmUMsKoMdgyH3lN_TVa7gxVciHE",
  authDomain: "civiclens-f3ed3.firebaseapp.com",
  projectId: "civiclens-f3ed3",
  storageBucket: "civiclens-f3ed3.appspot.com",
  messagingSenderId: "560286786244",
  appId: "1:560286786244:web:f69f1936d7ef7534441f91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const reportsContainer = document.getElementById("reports-container");

// -----------------
// Loader Overlay
// -----------------
const loadingDiv = document.createElement("div");
loadingDiv.id = "loading-overlay";
loadingDiv.innerHTML = `
  <div class="text-center p-4 bg-dark text-light rounded">
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-2">Loading reports...</p>
  </div>
`;
loadingDiv.style.display = "none";
document.body.appendChild(loadingDiv);

function showLoader() { loadingDiv.style.display = "flex"; }
function hideLoader() { loadingDiv.style.display = "none"; }

// -----------------
// Fetch Reports
// -----------------
async function fetchReports() {
  showLoader();
  reportsContainer.innerHTML = "";
  try {
    const reportsCol = collection(db, "reports");
    const q = query(reportsCol, orderBy("createdAt", "desc")); // Make sure "createdAt" field exists in Firestore

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      reportsContainer.innerHTML = `<div class="alert alert-warning">No reports found.</div>`;
      return;
    }

    snapshot.forEach(doc => {
      const report = doc.data();
      const card = document.createElement("div");
      card.className = "col-md-6 col-lg-4";
      card.innerHTML = `
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">${report.problem || 'N/A'} (${report.severity || 'N/A'})</h5>
            <p><strong>Description:</strong> ${report.description || 'N/A'}</p>
            <p><strong>Location:</strong> ${report.location || 'N/A'}</p>
            <p><strong>Department:</strong> ${report.department || 'N/A'}</p>
            <div class="d-flex flex-wrap gap-2 mb-2">
              ${report.images?.map(img => `<img src="${img}" class="img-thumbnail" style="width:80px;height:80px;object-fit:cover;">`).join('') || '<span>No Images</span>'}
            </div>
            <small class="text-muted">Submitted by: ${report.userId || 'Anonymous'}</small>
          </div>
        </div>
      `;
      reportsContainer.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    reportsContainer.innerHTML = `<div class="alert alert-danger">Failed to fetch reports.</div>`;
  } finally {
    hideLoader();
  }
}

// Initialize
window.addEventListener("DOMContentLoaded", fetchReports);
