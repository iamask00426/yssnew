document.documentElement.classList.add("js");

const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-site-nav]");

if (toggle && nav) {
  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) {
      return;
    }

    if (nav.contains(event.target) || toggle.contains(event.target)) {
      return;
    }

    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

const animatedItems = document.querySelectorAll(".animate-on-scroll");

if (animatedItems.length) {
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedItems.forEach((item) => {
      observer.observe(item);
    });
  } else {
    animatedItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }
}

/* ──────── Donate Amount Selection ──────── */
(function () {
  const amountsContainer = document.getElementById("donate-amounts");
  const customInput = document.getElementById("donate-custom-input");

  if (amountsContainer) {
    amountsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".donate-amount-btn");
      if (!btn) return;

      // Clear all selected
      amountsContainer.querySelectorAll(".donate-amount-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");

      // Clear custom input when preset selected
      if (customInput) customInput.value = "";
    });
  }

  if (customInput && amountsContainer) {
    customInput.addEventListener("input", () => {
      // Clear preset selection when custom input is used
      amountsContainer.querySelectorAll(".donate-amount-btn").forEach((b) => b.classList.remove("selected"));
    });
  }
})();

/* ──────── Join Form Logic ──────── */
(function () {
  // Multi-select dropdown
  const multiselect = document.getElementById("volunteer-multiselect");
  const msInput = document.getElementById("multiselect-input");
  const msDropdown = document.getElementById("multiselect-dropdown");
  const msChips = document.getElementById("multiselect-chips");
  const hiddenInput = document.getElementById("join-volunteer-type");

  const selectedValues = new Set();

  const optionLabels = {
    "social-media-repost": "Social Media Repost & Report",
    "onground-campaign": "On-Ground Campaign",
  };

  function renderChips() {
    if (!msChips) return;
    msChips.innerHTML = "";

    if (selectedValues.size === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "multiselect-placeholder";
      placeholder.textContent = "Select Volunteer Type";
      msChips.appendChild(placeholder);
    } else {
      selectedValues.forEach((val) => {
        const chip = document.createElement("span");
        chip.className = "multiselect-chip";
        chip.textContent = optionLabels[val] || val;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "multiselect-chip-remove";
        removeBtn.textContent = "✕";
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleOption(val);
        });

        chip.appendChild(removeBtn);
        msChips.appendChild(chip);
      });
    }

    if (hiddenInput) {
      hiddenInput.value = Array.from(selectedValues).join(",");
    }
  }

  function toggleOption(value) {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
    } else {
      selectedValues.add(value);
    }

    // Update option styling
    if (msDropdown) {
      msDropdown.querySelectorAll(".multiselect-option").forEach((opt) => {
        if (opt.dataset.value === value) {
          opt.classList.toggle("selected", selectedValues.has(value));
        }
      });
    }

    renderChips();
  }

  if (multiselect && msInput && msDropdown) {
    // Toggle dropdown
    msInput.addEventListener("click", () => {
      multiselect.classList.toggle("open");
    });

    // Option click
    msDropdown.addEventListener("click", (e) => {
      const option = e.target.closest(".multiselect-option");
      if (!option) return;
      toggleOption(option.dataset.value);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!multiselect.contains(e.target)) {
        multiselect.classList.remove("open");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        multiselect.classList.remove("open");
      }
    });
  }

  // File Upload (National ID)
  const uploadZone = document.getElementById("file-upload-zone");
  const fileInput = document.getElementById("join-national-id");
  const uploadContent = document.getElementById("file-upload-content");
  const filePreview = document.getElementById("file-preview");
  const filePreviewImg = document.getElementById("file-preview-img");
  const fileNameEl = document.getElementById("file-name");
  const fileRemoveBtn = document.getElementById("file-remove-btn");

  function showPreview(file) {
    if (!file || !file.type.startsWith("image/")) return;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      filePreviewImg.src = e.target.result;
      uploadContent.style.display = "none";
      filePreview.style.display = "flex";
      fileNameEl.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  function clearUpload() {
    if (fileInput) fileInput.value = "";
    if (uploadContent) uploadContent.style.display = "flex";
    if (filePreview) filePreview.style.display = "none";
    if (filePreviewImg) filePreviewImg.src = "";
    if (fileNameEl) fileNameEl.textContent = "";
  }

  if (uploadZone && fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) {
        showPreview(fileInput.files[0]);
      }
    });

    // Drag and drop
    ["dragenter", "dragover"].forEach((evt) => {
      uploadZone.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      uploadZone.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadZone.classList.remove("dragover");
      });
    });

    uploadZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        fileInput.files = files;
        showPreview(files[0]);
      }
    });
  }

  if (fileRemoveBtn) {
    fileRemoveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearUpload();
    });
  }

  // Location auto-fetch
  const fetchLocBtn = document.getElementById("fetch-location-btn");
  const locationInput = document.getElementById("join-location");

  if (fetchLocBtn && locationInput) {
    fetchLocBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        locationInput.value = "Geolocation not supported";
        return;
      }

      fetchLocBtn.classList.add("loading");
      locationInput.value = "Detecting location...";

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await response.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.county ||
              "";
            const state = addr.state || "";
            locationInput.value = [city, state].filter(Boolean).join(", ");
          } catch {
            locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          fetchLocBtn.classList.remove("loading");
        },
        (err) => {
          fetchLocBtn.classList.remove("loading");
          locationInput.value = "";
          locationInput.placeholder = "Could not detect location";
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    });
  }

  // Form submission
  const joinForm = document.getElementById("join-form");
  const formMessage = document.getElementById("form-message");

  if (joinForm && formMessage) {
    joinForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validate volunteer type
      if (hiddenInput && !hiddenInput.value) {
        formMessage.style.display = "block";
        formMessage.className = "form-message error";
        formMessage.textContent =
          "Please select at least one volunteer type.";
        return;
      }

      // Show loading
      const submitBtn = document.getElementById("join-submit-btn");
      const btnText = submitBtn.querySelector(".btn-text");
      const btnLoader = submitBtn.querySelector(".btn-loader");
      btnText.textContent = "Submitting...";
      btnLoader.style.display = "inline-flex";
      submitBtn.disabled = true;

      // Simulate submission (replace with actual API call)
      setTimeout(() => {
        formMessage.style.display = "block";
        formMessage.className = "form-message success";
        formMessage.textContent =
          "🎉 Application submitted successfully! Welcome to YSS — we'll be in touch soon.";

        btnText.textContent = "Submit Application";
        btnLoader.style.display = "none";
        submitBtn.disabled = false;

        joinForm.reset();

        // Clear multi-select
        selectedValues.clear();
        if (msDropdown) {
          msDropdown.querySelectorAll(".multiselect-option").forEach((o) => o.classList.remove("selected"));
        }
        renderChips();

        // Clear file upload
        clearUpload();

        // Scroll to message
        formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 1500);
    });
  }
})();
