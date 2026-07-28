const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function expectedHostnames() {
  return new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
}

/**
 * Validates a Turnstile token before the protected handler runs.
 *
 * The optional failure handler is kept at the route boundary so a form can
 * re-render with its existing error UI without exposing verification details.
 */
module.exports = function verifyTurnstile(expectedAction, onFailure) {
  return async (req, res, next) => {
    const token = req.body["cf-turnstile-response"];
    const hostnames = expectedHostnames();
    const secret = process.env.TURNSTILE_SECRET;

    const reject = () => {
      if (onFailure) return onFailure(req, res);
      return res.status(403).send("forbidden");
    };

    if (
      typeof token !== "string" ||
      token.length === 0 ||
      token.length > 2048 ||
      typeof secret !== "string" ||
      secret.trim().length === 0 ||
      hostnames.size === 0
    ) {
      return reject();
    }

    let result;
    try {
      const response = await fetch(SITEVERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: req.ip ?? "",
        }),
      });

      if (!response.ok) throw new Error(`siteverify ${response.status}`);
      result = await response.json();
    } catch {
      return reject();
    }

    if (
      !result.success ||
      result.action !== expectedAction ||
      !hostnames.has(result.hostname)
    ) {
      return reject();
    }

    return next();
  };
};
