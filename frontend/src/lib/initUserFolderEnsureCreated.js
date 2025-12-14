// lib/initUserFolderEnsureCreated.js
export async function initUserFolderEnsureCreated(accessToken, profileData = {}, retries = 4, baseDelayMs = 500) {
  const url = "/api/users/init";

  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const json = await res.json();

      if (res.ok) {
        console.info(`initUserFolderEnsureCreated succeeded on attempt ${attempt}`);
        return { ok: true, data: json };
      }

      lastError = json.error || json;
      console.warn(`initUserFolderEnsureCreated attempt ${attempt} failed:`, lastError);
    } catch (err) {
      lastError = err.message || err;
      console.warn(`initUserFolderEnsureCreated attempt ${attempt} threw:`, err);
    }

    // Exponential backoff with jitter
    if (attempt < retries) {
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * (delay * 0.25));
      await new Promise((res) => setTimeout(res, delay + jitter));
    }
  }

  return { ok: false, error: `Failed after ${retries} attempts: ${lastError}` };
}
