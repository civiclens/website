// report-details.js

// Normalize function: lowercase, trim, spaces/hyphens -> underscore, remove non-alphanum/_.
function normalizeLabel(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// Allocation map (values match the department <option> texts in your HTML)
const allocationMap = {
  road: "Municipal Corporation",
  street_light: "Municipality",
  garbage: "Municipality",
  water: "Municipal Corporation",
  medical: "Township",
  electricity: "Municipal Corporation",
  traffic_signal: "Municipality",
  potholes: "Municipal Corporation",
  drainage: "Municipality",
  parking: "Municipal Corporation",
  pollution: "Municipality",
  animal_control: "Municipal Corporation",
  public_transport: "Town Area Committee",
  parks: "Township",
  fire_safety: "Cantonment Board",
  construction: "Special Purpose Agency",
  education: "Notified Area Committee",
  sanitation: "Municipality",
  waterlogging: "Municipal Corporation",
  other: "Municipal Corporation"
};

// DOM references
const preview = document.getElementById("preview-images");
const issueDescEl = document.getElementById("issue-description");
const issueLocEl = document.getElementById("issue-location");
const problemSelect = document.getElementById("problem-type");
const severitySelect = document.querySelectorAll(".form-select")[1];
const departmentSelect = document.querySelectorAll(".form-select")[2];
const submitBtn = document.querySelector(".btn-success");

// Helper to set problem select by normalized key (tries to match an option)
function setProblemSelectByKey(normalizedKey) {
  const options = Array.from(problemSelect.options);
  // 1) exact normalized match
  let match = options.find(opt => normalizeLabel(opt.text) === normalizedKey);

  // 2) try fuzzy: remove underscores and compare
  if (!match) {
    match = options.find(opt => normalizeLabel(opt.text).replace(/_/g, "") === normalizedKey.replace(/_/g, ""));
  }

  // 3) try substring match of normalizedKey inside option or vice versa
  if (!match) {
    match = options.find(opt => normalizeLabel(opt.text).includes(normalizedKey) || normalizedKey.includes(normalizeLabel(opt.text)));
  }

  // 4) fallback to 'Other' option if present
  if (!match) {
    match = options.find(opt => normalizeLabel(opt.text) === "other");
  }

  if (match) {
    problemSelect.value = match.text;
    return normalizeLabel(match.text);
  }
  return null;
}

// Helper to set department select by department name (must match option text)
function setDepartmentByName(deptName) {
  const opts = Array.from(departmentSelect.options);
  const found = opts.find(opt => opt.text.trim() === deptName);
  if (found) departmentSelect.value = found.text;
}

// Update department based on currently selected problem
function updateDepartmentFromProblem(selectedProblemText) {
  const key = normalizeLabel(selectedProblemText); // e.g. "street_light"
  const dept = allocationMap[key] || allocationMap["other"];
  setDepartmentByName(dept);
}

// Load stored reportData and pre-fill UI
const data = JSON.parse(localStorage.getItem("reportData"));

if (data) {
  // Show text fields
  issueDescEl.textContent = data.description || "";
  issueLocEl.textContent = data.location || "";

  // Show images (base64 strings)
  if (Array.isArray(data.files)) {
    preview.innerHTML = "";
    data.files.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.classList.add("preview-img");
      img.style.maxWidth = "120px";
      img.style.margin = "4px";
      preview.appendChild(img);
    });
  }

  // Determine predicted label (robust)
  const predictedRaw = (data.predictedProblem || data.predicted_class || data.predicted || "").toString();
  const normalizedPredicted = normalizeLabel(predictedRaw);

  // Try to set problem select using predicted label
  const matchedKey = setProblemSelectByKey(normalizedPredicted);

  // If we couldn't match above, attempt to find a key by checking if the predicted contains any known key
  let finalKey = matchedKey || normalizedPredicted;
  if (!allocationMap[finalKey]) {
    const candidateKey = Object.keys(allocationMap).find(k => normalizedPredicted.includes(k));
    if (candidateKey) finalKey = candidateKey;
  }

  // Finally update department based on determined key
  const deptName = allocationMap[finalKey] || allocationMap["other"];
  setDepartmentByName(deptName);
}

// If user manually changes problem type, auto-update department
problemSelect.addEventListener("change", (e) => {
  updateDepartmentFromProblem(e.target.value);
});

// Submit: build finalReport and redirect
submitBtn.addEventListener("click", () => {
  const reportData = JSON.parse(localStorage.getItem("reportData")) || {};

  const finalData = {
    ...reportData,
    problem: problemSelect.value,
    severity: severitySelect.value,
    department: departmentSelect.value
  };

  localStorage.setItem("finalReport", JSON.stringify(finalData));
  window.location.href = "overview.html";
});
