// -----------------------------
// Firebase Initialization
// -----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkqd_6qmUMsKoMdgyH3lN_TVa7gxVciHE",
    authDomain: "civiclens-f3ed3.firebaseapp.com",
    projectId: "civiclens-f3ed3",
    storageBucket: "civiclens-f3ed3.firebasestorage.app",
    messagingSenderId: "560286786244",
    appId: "1:560286786244:web:f69f1936d7ef7534441f91"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------------
// Loader Functions
// -----------------------------
function showLoader(message = "Processing...") {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-overlay";
    loadingDiv.innerHTML = `
      <div class="loading-spinner text-center p-4 bg-dark text-light" style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);border-radius:8px;">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">${message}</p>
      </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoader() {
    document.getElementById("loading-overlay")?.remove();
}

// -----------------------------
// Cloudinary Upload
// -----------------------------
async function uploadImagesToCloudinary(files, complaintId, userId) {
    const uploadedUrls = [];

    for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        // -----------------------------
        // TODO: Replace with your Cloudinary unsigned preset & cloud name
        // -----------------------------
        formData.append("upload_preset", "complaint_upload");
        const cloudName = "duz8urink"; // replace with your Cloudinary cloud name
        formData.append("folder", `complaints/${userId}/${complaintId}`);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            console.error("Cloudinary upload failed for", file.name);
            continue;
        }

        const data = await response.json();
        uploadedUrls.push(data.secure_url);
    }

    return uploadedUrls;
}

// -----------------------------
// Save Report to Firestore
// -----------------------------
async function saveReportToFirestore(reportData) {
    try {
        const docRef = await addDoc(collection(db, "reports"), reportData);
        console.log("Report saved with ID:", docRef.id);
        alert("✅ Report submitted successfully!");
    } catch (error) {
        console.error("Error saving report:", error);
        alert("❌ Failed to submit report!");
    }
}

// -----------------------------
// Load Data from localStorage
// -----------------------------
const data = JSON.parse(localStorage.getItem("finalReport"));
if (data) {
    document.getElementById("issue-description").textContent = data.description;
    document.getElementById("issue-location").textContent = data.location;
    document.getElementById("issue-problem").textContent = data.problem;
    document.getElementById("issue-severity").textContent = data.severity;
    document.getElementById("issue-department").textContent = data.department;

    const preview = document.getElementById("preview-images");
    data.files.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.className = "img-thumbnail";
        img.style.width = "150px";
        img.style.height = "auto";
        preview.appendChild(img);
    });
} else {
    document.querySelector(".container").innerHTML = `
        <div class="alert alert-warning">
          ⚠️ No report data found. Please submit a report first.
        </div>`;
}

// -----------------------------
// Confirm & Submit Button
// -----------------------------
document.querySelector(".btn-success").addEventListener("click", async (e) => {
    e.preventDefault();
    if (!data) return;

    const complaintId = Date.now().toString(); // unique complaintId
    const userId = "123456"; // example userId

    // Convert Base64 images back to File objects
    const files = data.files.map((base64, i) => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], `image${i}.png`, { type: mime });
    });

    showLoader("Uploading images...");

    try {
        const imageUrls = await uploadImagesToCloudinary(files, complaintId, userId);

        const reportData = {
            complaintId,
            userId,
            description: data.description,
            location: data.location,
            problem: data.problem,
            severity: data.severity,
            department: data.department,
            images: imageUrls,
            createdAt: new Date()
        };

        await saveReportToFirestore(reportData);

        // Optionally redirect
        window.location.href = "thank-you.html";

    } catch (error) {
        console.error(error);
        alert("❌ Failed to submit report.");
    } finally {
        hideLoader();
    }
});
