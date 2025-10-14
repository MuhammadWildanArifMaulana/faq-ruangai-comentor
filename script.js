document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("faqSearch");
  const accordionItems = document.querySelectorAll(".accordion-item");
  const faqCounter = document.getElementById("faqCounter");
  const totalFaqs = accordionItems.length;

  function updateCounter(visibleCount) {
    faqCounter.textContent = `Showing ${visibleCount} of ${totalFaqs} FAQs`;
  }

  function filterFAQs() {
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    accordionItems.forEach((item) => {
      const question = item
        .querySelector(".accordion-button")
        .textContent.toLowerCase();
      const answer = item
        .querySelector(".accordion-body")
        .textContent.toLowerCase();

      if (question.includes(query) || answer.includes(query)) {
        item.style.display = "block";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });
    updateCounter(visibleCount);
  }
  updateCounter(totalFaqs);
  searchInput.addEventListener("input", filterFAQs);

  // Voting features removed — the site is static. The script handles search/filter only.

  // Theme toggle: default is dark (no class). Persist choice in localStorage.
  const themeToggleBtn = document.getElementById("themeToggle");
  const body = document.body;
  const THEME_KEY = "site-theme"; // values: "dark" or "light"

  function applyTheme(theme) {
    if (theme === "light") {
      body.classList.add("theme-light");
      if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
    } else {
      body.classList.remove("theme-light");
      if (themeToggleBtn) themeToggleBtn.textContent = "🌙";
    }
  }

  // Initialize from saved preference (if any)
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
    } else {
      // default: dark (no class)
      applyTheme("dark");
    }
  } catch (e) {
    // localStorage may be unavailable; fallback to default dark
    applyTheme("dark");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      const isLight = body.classList.contains("theme-light");
      const next = isLight ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // ignore storage errors
      }
    });
  }

  // No other interactive widgets on this page.
});
