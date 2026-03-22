// Cashfree integration utility for frontend demo (test mode only)
// In production, always use a backend to generate tokens securely!

export const CASHFREE_APP_ID = "227192201cfc960517b1860f21291722"; // Test AppID
export const CASHFREE_SCRIPT = "https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js";

// Utility to dynamically load the Cashfree JS SDK
export function loadCashfreeScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById("cashfree-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "cashfree-sdk";
    script.src = CASHFREE_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => reject(false);
    document.body.appendChild(script);
  });
}
