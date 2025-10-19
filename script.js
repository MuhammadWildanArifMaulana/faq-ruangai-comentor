document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("faqSearch");
  const accordionItems = Array.from(
    document.querySelectorAll(".accordion-item")
  );
  const faqCounter = document.getElementById("faqCounter");
  const totalFaqs = accordionItems.length;

  function updateCounter(visibleCount) {
    if (faqCounter)
      faqCounter.textContent = `Showing ${visibleCount} of ${totalFaqs} FAQs`;
  }

  function filterFAQs() {
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    accordionItems.forEach((item) => {
      const questionEl = item.querySelector(".accordion-button");
      const answerEl = item.querySelector(".accordion-body");
      const question = questionEl ? questionEl.textContent.toLowerCase() : "";
      const answer = answerEl ? answerEl.textContent.toLowerCase() : "";

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
  if (searchInput) searchInput.addEventListener("input", filterFAQs);

  // Theme toggle
  const themeToggleBtn = document.getElementById("themeToggle");
  const body = document.body;
  const THEME_KEY = "site-theme";

  function applyTheme(theme) {
    if (theme === "light") {
      body.classList.add("theme-light");
      if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
    } else {
      body.classList.remove("theme-light");
      if (themeToggleBtn) themeToggleBtn.textContent = "🌙";
    }
  }

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") applyTheme(saved);
    else applyTheme("dark");
  } catch (e) {
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
        /* ignore */
      }
    });
  }

  // Prevent mobile/tablet page jump when opening/closing accordion items
  (function preventAccordionJumpOnMobile() {
    try {
      const mq = window.matchMedia("(max-width: 1024px)");
      const accordion = document.getElementById("faqAccordion");
      if (!accordion) return;

      let lastScroll = 0;

      const saveScroll = (e) => {
        lastScroll = window.scrollY || window.pageYOffset || 0;
        try {
          if (
            e &&
            e.currentTarget &&
            typeof e.currentTarget.blur === "function"
          )
            e.currentTarget.blur();
        } catch (er) {}
      };

      accordion.querySelectorAll(".accordion-button").forEach((btn) => {
        btn.addEventListener("pointerdown", saveScroll, { passive: true });
        btn.addEventListener("touchstart", saveScroll, { passive: true });
        btn.addEventListener("click", saveScroll);
      });

      function restoreScroll(targetScroll) {
        [0, 80, 160].forEach((delay) => {
          setTimeout(() => {
            try {
              window.scrollTo({ top: targetScroll, behavior: "auto" });
            } catch (err) {}
          }, delay);
        });
      }

      accordion.addEventListener("hidden.bs.collapse", function () {
        restoreScroll(lastScroll);
      });

      accordion.addEventListener("shown.bs.collapse", function () {
        restoreScroll(lastScroll);
      });
    } catch (err) {
      console.error("preventAccordionJumpOnMobile error", err);
    }
  })();
});
