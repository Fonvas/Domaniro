// Embeddable "Check a domain" widget. Any element with
// [data-domain-checker-widget] gets this behavior automatically.

const SCORE_ENDPOINT = "/api/score";

function bandForScore(score) {
  if (score === null || score === undefined) return "unknown";
  if (score < 3) return "low";
  if (score < 6) return "mid";
  return "high";
}

function formatReferringDomains(count) {
  if (count === null || count === undefined) return "—";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

function formatRank(rank) {
  if (rank === null || rank === undefined || rank <= 0) return "—";
  if (rank >= 1_000_000) return `#${(rank / 1_000_000).toFixed(1)}M`;
  if (rank >= 1_000) return `#${(rank / 1_000).toFixed(1)}K`;
  return `#${rank}`;
}

function normalizeInput(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;
  try {
    const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function initWidget(root) {
  const input = root.querySelector("[data-domain-input]");
  const button = root.querySelector("[data-domain-submit]");
  const resultEl = root.querySelector("[data-domain-result]");
  const errorEl = root.querySelector("[data-domain-error]");
  if (!input || !button || !resultEl) return;

  async function check() {
    const domain = normalizeInput(input.value);
    errorEl.hidden = true;
    resultEl.hidden = true;

    if (!domain) {
      errorEl.textContent = "Enter a valid domain, e.g. example.com";
      errorEl.hidden = false;
      return;
    }

    button.disabled = true;
    button.textContent = "Checking...";

    try {
      const res = await fetch(`${SCORE_ENDPOINT}?domain=${encodeURIComponent(domain)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();

      if (!res.ok || data.error || typeof data.score !== "number") {
        errorEl.textContent = `No data available yet for ${domain}.`;
        errorEl.hidden = false;
        return;
      }

      root.querySelector("[data-domain-name]").textContent = domain;
      const scoreNumEl = root.querySelector("[data-domain-score]");
      scoreNumEl.textContent = data.score;
      scoreNumEl.dataset.band = bandForScore(data.score);
      root.querySelector("[data-domain-rank]").textContent = formatRank(data.rank);
      root.querySelector("[data-domain-referring]").textContent = formatReferringDomains(data.referringDomains);
      root.dataset.band = bandForScore(data.score);
      resultEl.hidden = false;
    } catch (err) {
      errorEl.textContent = "Couldn't reach the scoring service. Try again in a moment.";
      errorEl.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = "Check";
    }
  }

  button.addEventListener("click", check);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") check();
  });
}

document.querySelectorAll("[data-domain-checker-widget]").forEach(initWidget);
