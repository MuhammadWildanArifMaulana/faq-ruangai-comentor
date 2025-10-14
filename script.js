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

  /* Voting widget (localStorage) */
  const VOTE_KEY = "ruangai_live_vote"; // stores 'yes' or 'no'
  const COUNT_KEY = "ruangai_live_count"; // stores { yes: n, no: m }

  const voteYesBtn = document.getElementById("voteYes");
  const voteNoBtn = document.getElementById("voteNo");
  const voteResults = document.getElementById("voteResults");
  const countYesEl = document.getElementById("countYes");
  const countNoEl = document.getElementById("countNo");
  const barYes = document.getElementById("barYes");
  const barNo = document.getElementById("barNo");

  function readCounts() {
    try {
      const raw = localStorage.getItem(COUNT_KEY);
      if (!raw) return { yes: 0, no: 0 };
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse vote counts from localStorage", e);
      return { yes: 0, no: 0 };
    }
  }

  function writeCounts(counts) {
    localStorage.setItem(COUNT_KEY, JSON.stringify(counts));
  }

  function userVoted() {
    return !!localStorage.getItem(VOTE_KEY);
  }

  function showResults() {
    const counts = readCounts();
    const total = counts.yes + counts.no;
    const yesPct = total === 0 ? 0 : Math.round((counts.yes / total) * 100);
    const noPct = total === 0 ? 0 : 100 - yesPct;

    countYesEl.textContent = counts.yes;
    countNoEl.textContent = counts.no;
    // animate bars to final width (works with <progress> and div fallbacks)
    if (barYes && barNo) {
      try {
        // reset visually
        barYes.value = 0;
        barNo.value = 0;
        barYes.style.width = "0%";
        barNo.style.width = "0%";

        setTimeout(() => {
          barYes.value = yesPct;
          barYes.setAttribute("aria-valuenow", yesPct);
          barNo.value = noPct;
          barNo.setAttribute("aria-valuenow", noPct);

          barYes.style.width = yesPct + "%";
          barNo.style.width = noPct + "%";

          setTimeout(() => {
            barYes.textContent = yesPct + "%";
            barNo.textContent = noPct + "%";
          }, 700);
        }, 60);
      } catch (err) {
        console.error("Error updating progress bars", err);
        // fallback
        barYes.textContent = yesPct + "%";
        barNo.textContent = noPct + "%";
      }
    }
    // always ensure results container visible after update
    if (voteResults) voteResults.style.display = "block";
  }

  function hideButtons() {
    if (voteYesBtn) voteYesBtn.style.display = "none";
    if (voteNoBtn) voteNoBtn.style.display = "none";
  }

  function handleVote(choice) {
    if (userVoted()) return; // safety
    const counts = readCounts();
    if (choice === "yes") counts.yes = (counts.yes || 0) + 1;
    if (choice === "no") counts.no = (counts.no || 0) + 1;
    // Optimistic UI + server-backed update via Netlify Function
    hideButtons();
    const confirmEl = document.getElementById("voteConfirm");
    if (confirmEl) {
      confirmEl.textContent = "Terima kasih untuk suaramu — mengirim suara...";
      confirmEl.classList.add("show");
    }

    // Try sending to serverless function. If it fails, fallback to local only.
    fetch("/.netlify/functions/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Function error");
        const data = await res.json();
        // data should contain aggregated { yes, no }
        writeCounts(data);
        localStorage.setItem(VOTE_KEY, choice);
        confirmEl &&
          (confirmEl.textContent = "Suara terkirim! Menampilkan hasil...");
        setTimeout(showResults, 600);
      })
      .catch((err) => {
        console.warn("Server vote failed, falling back to localStorage", err);
        // fallback: store locally only
        writeCounts(counts);
        localStorage.setItem(VOTE_KEY, choice);
        confirmEl && (confirmEl.textContent = "Suara disimpan secara lokal.");
        setTimeout(showResults, 600);
      });
  }

  if (
    voteYesBtn &&
    voteNoBtn &&
    voteResults &&
    countYesEl &&
    countNoEl &&
    barYes &&
    barNo
  ) {
    // Initial render: only show aggregated results after this user has voted
    if (userVoted()) {
      hideButtons();
      showResults();
    } else {
      // keep buttons visible and do NOT display aggregated counts yet
      // (we still read counts to ensure values exist in storage)
    }

    voteYesBtn.addEventListener("click", function () {
      handleVote("yes");
    });
    voteNoBtn.addEventListener("click", function () {
      handleVote("no");
    });
  }
});
