// Netlify Function: vote.js
// Minimal implementation that updates a single `votes` row in Supabase via REST.
// Expects environment variables:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// Endpoint: POST /.netlify/functions/vote with JSON { choice: 'yes'|'no' }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async function (event) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const choice =
    body.choice === "yes" ? "yes" : body.choice === "no" ? "no" : null;
  if (!choice) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid choice" }),
    };
  }

  try {
    // Basic flow: get existing row (id=1), then update counts.
    const selectRes = await fetch(`${SUPABASE_URL}/rest/v1/votes?id=eq.1`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
    });
    if (!selectRes.ok) throw new Error("Failed to read counts");
    const rows = await selectRes.json();

    let counts = { yes: 0, no: 0 };
    if (rows && rows.length) {
      counts = { yes: Number(rows[0].yes || 0), no: Number(rows[0].no || 0) };
      counts[choice] = (counts[choice] || 0) + 1;

      // Update row id=1
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/votes?id=eq.1`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ yes: counts.yes, no: counts.no }),
      });
      if (!patchRes.ok) throw new Error("Failed to update counts");
    } else {
      // No row exists: create it
      counts[choice] = 1;
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ id: 1, yes: counts.yes, no: counts.no }),
      });
      if (!insertRes.ok) throw new Error("Failed to create counts");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ yes: counts.yes, no: counts.no }),
    };
  } catch (err) {
    console.error("Vote function error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Server error" }),
    };
  }
};
