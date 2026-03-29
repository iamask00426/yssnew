document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

[
  ".page-hero .content-panel",
  ".page-hero .ek-showcase",
  ".contact-layout",
  ".section .section-header",
  ".section .card",
  ".section .campaign-card",
  ".section .value-card",
  ".section .donation-card",
  ".section .join-role",
  ".section .contact-detail",
  ".section .contact-visual-card",
  ".section .join-form-wrapper",
  ".section .photo-frame.media-card",
  ".section .trust-shell",
].forEach((selector) => {
  document.querySelectorAll(selector).forEach((element) => {
    element.classList.add("animate-on-scroll");
  });
});

const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-site-nav]");

if (toggle && nav) {
  const closeNav = () => {
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const toggleNav = () => {
    const willOpen = !nav.classList.contains("open");
    nav.classList.toggle("open", willOpen);
    document.body.classList.toggle("nav-open", willOpen);
    toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
  };

  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", toggleNav);

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) {
      return;
    }

    if (nav.contains(event.target) || toggle.contains(event.target)) {
      return;
    }

    closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && nav.classList.contains("open")) {
      closeNav();
    }
  });
}

const animatedItems = document.querySelectorAll(".animate-on-scroll");
const countTargets = document.querySelectorAll("[data-count]");

function animateCount(target) {
  if (target.dataset.counted === "true") {
    return;
  }

  const finalValue = Number.parseInt(target.dataset.count || target.textContent, 10);

  if (Number.isNaN(finalValue)) {
    return;
  }

  target.dataset.counted = "true";

  if (prefersReducedMotion) {
    target.textContent = String(finalValue);
    return;
  }

  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    target.textContent = String(Math.max(0, Math.round(finalValue * eased)));

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  target.textContent = "0";
  window.requestAnimationFrame(step);
}

if (animatedItems.length || countTargets.length) {
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (entry.target.classList.contains("animate-on-scroll")) {
            entry.target.classList.add("is-visible");
          }

          if (entry.target.hasAttribute("data-count")) {
            animateCount(entry.target);
          }

          currentObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.18,
      }
    );

    animatedItems.forEach((item) => {
      observer.observe(item);
    });

    countTargets.forEach((target) => {
      observer.observe(target);
    });
  } else {
    animatedItems.forEach((item) => {
      item.classList.add("is-visible");
    });

    countTargets.forEach((target) => {
      animateCount(target);
    });
  }
}

(function () {
  const donatePageHref = window.location.pathname.includes("/pages/")
    ? "./donate.html"
    : "./pages/donate.html";
  const contactPageHref = window.location.pathname.includes("/pages/")
    ? "./contact.html"
    : "./pages/contact.html";
  const isDonatePage = /\/donate\.html$/.test(window.location.pathname);
  const firstVisitPopupKey = "yss-donate-popup-seen";

  const modal = document.createElement("div");
  modal.className = "donate-modal";
  modal.setAttribute("hidden", "");
  modal.innerHTML = `
    <div class="donate-modal-backdrop" data-donate-close></div>
    <div class="donate-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="donate-modal-title">
      <button class="donate-modal-close" type="button" aria-label="Close donation popup" data-donate-close>&times;</button>
      <span class="eyebrow">Support YSS</span>
      <h2 id="donate-modal-title">Back the work happening on the ground.</h2>
      <p class="donate-modal-copy">
        Choose a support amount to continue. Your contribution helps YSS strengthen drives,
        awareness work, volunteer coordination, and Ek Prayas employment support.
      </p>
      <div class="donate-modal-amounts" role="group" aria-label="Suggested donation amounts">
        <button type="button" class="donate-modal-amount active" data-donate-amount="500">₹500</button>
        <button type="button" class="donate-modal-amount" data-donate-amount="1000">₹1,000</button>
        <button type="button" class="donate-modal-amount" data-donate-amount="2500">₹2,500</button>
        <button type="button" class="donate-modal-amount" data-donate-amount="5000">₹5,000</button>
      </div>
      <p class="donate-modal-note">Selected support: <strong data-donate-selected>₹500</strong></p>
      <div class="donate-modal-actions">
        <a class="btn" href="${donatePageHref}?amount=500" data-donate-continue>Continue to Donate</a>
        <a class="btn-secondary" href="${contactPageHref}">Need donation help?</a>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeButtons = modal.querySelectorAll("[data-donate-close]");
  const amountButtons = modal.querySelectorAll("[data-donate-amount]");
  const selectedText = modal.querySelector("[data-donate-selected]");
  const continueLink = modal.querySelector("[data-donate-continue]");
  let lastFocusedElement = null;
  let selectedAmount = 500;

  function markPopupSeen() {
    try {
      window.localStorage.setItem(firstVisitPopupKey, "true");
    } catch {}
  }

  function hasSeenPopup() {
    try {
      return window.localStorage.getItem(firstVisitPopupKey) === "true";
    } catch {
      return false;
    }
  }

  function updateDonateSelection(amount) {
    selectedAmount = amount;
    amountButtons.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.donateAmount) === amount);
    });
    selectedText.textContent = `₹${amount.toLocaleString("en-IN")}`;
    continueLink.href = `${donatePageHref}?amount=${amount}`;
  }

  function openDonateModal() {
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    updateDonateSelection(selectedAmount);
    const activeButton = modal.querySelector(".donate-modal-amount.active");
    if (activeButton) {
      activeButton.focus();
    }
  }

  function closeDonateModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    markPopupSeen();
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeDonateModal);
  });

  amountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateDonateSelection(Number(button.dataset.donateAmount));
    });
  });

  continueLink.addEventListener("click", () => {
    markPopupSeen();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeDonateModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeDonateModal();
    }
  });

  if (!isDonatePage && !hasSeenPopup()) {
    window.setTimeout(() => {
      openDonateModal();
      markPopupSeen();
    }, prefersReducedMotion ? 400 : 1800);
  }
})();

/* ──────── Donate Amount Selection ──────── */
(function () {
  const amountsContainer = document.getElementById("donate-amounts");
  const customInput = document.getElementById("donate-custom-input");
  const amountFromQuery = Number.parseInt(new URLSearchParams(window.location.search).get("amount") || "", 10);

  function selectAmount(amount) {
    if (!amountsContainer) return;
    let matchedPreset = false;

    amountsContainer.querySelectorAll(".donate-amount-btn").forEach((button) => {
      const isMatch = Number(button.dataset.amount) === amount;
      button.classList.toggle("selected", isMatch);
      if (isMatch) {
        matchedPreset = true;
      }
    });

    if (customInput) {
      customInput.value = matchedPreset ? "" : String(amount);
    }
  }

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

  if (amountsContainer && Number.isFinite(amountFromQuery) && amountFromQuery > 0) {
    selectAmount(amountFromQuery);
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
