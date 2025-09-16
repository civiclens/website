// -----------------------------
// Elements
// -----------------------------
const inputFile = document.getElementById("input-file");
const fileList = document.getElementById("file-list");
const dropArea = document.getElementById("drop-area");
const reportForm = document.getElementById("reportForm");
let selectedFiles = [];

// -----------------------------
// Loader (Reusable)
// -----------------------------
function showLoader(message = "Processing...") {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-overlay";
    loadingDiv.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoader() {
    document.getElementById("loading-overlay")?.remove();
}

// -----------------------------
// File Input Handling
// -----------------------------
inputFile.addEventListener("change", () => {
    handleFiles(inputFile.files);
    inputFile.value = "";
});

// Drag & Drop
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    const newFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    selectedFiles = [...selectedFiles, ...newFiles];
    renderFileList();
}

function renderFileList() {
    fileList.innerHTML = "";
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);

        const name = document.createElement("span");
        name.textContent = file.name;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✖";
        removeBtn.className = "remove-btn";
        removeBtn.type = "button";
        removeBtn.onclick = () => {
            selectedFiles.splice(index, 1);
            renderFileList();
        };

        fileItem.appendChild(img);
        fileItem.appendChild(name);
        fileItem.appendChild(removeBtn);
        fileList.appendChild(fileItem);
    });
}

// -----------------------------
// File → Base64
// -----------------------------
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// -----------------------------
// Form Submit
// -----------------------------
reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = document.getElementById("issue-description").value;
    const location = document.getElementById("location").value;

    if (!description.trim()) {
        alert("⚠️ Please describe the issue");
        return;
    }

    showLoader("Classifying issue...");

    try {
        // Convert all images to Base64
        const filesData = await Promise.all(selectedFiles.map(file => fileToBase64(file)));

        // Call FastAPI backend for classification
        const response = await fetch("https://civiclens-utsi.onrender.com/classify_text/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: description })
        });

        const result = await response.json();
        const predictedProblem = result.predicted_class || "other";

        const reportData = {
            description,
            location,
            files: filesData,
            predictedProblem
        };

        localStorage.setItem("reportData", JSON.stringify(reportData));

        // Redirect to details page
        window.location.href = "report-details.html";

    } catch (error) {
        alert("❌ Failed to classify complaint. Check backend.");
        console.error(error);
    } finally {
        hideLoader();
    }
});

// -----------------------------
// Location with loader
// -----------------------------
function getLocation() {
    if (navigator.geolocation) {
        showLoader("Fetching your location...");
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("❌ Geolocation not supported");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("location").value = data.display_name;
        })
        .catch(() => {
            alert("⚠️ Failed to fetch location name.");
        })
        .finally(() => {
            hideLoader();
        });
}

function showError(error) {
    let message = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "❌ User denied location request.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "❌ Location unavailable.";
            break;
        case error.TIMEOUT:
            message = "⏳ Location request timed out.";
            break;
        default:
            message = "⚠️ Unknown error.";
    }
    hideLoader();
    alert(message);
}
