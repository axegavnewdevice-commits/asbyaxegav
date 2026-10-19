(() => {
  "use strict";
  const installButton = document.getElementById("install-app");
  const networkStatus = document.getElementById("pwa-network-status");
  let deferredInstallPrompt = null;
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const setNetworkStatus = () => {
    if (!networkStatus) return;
    const offline = !navigator.onLine;
    networkStatus.classList.toggle("is-offline", offline);
    networkStatus.textContent = offline ? "غير متصل — وضع العمل دون إنترنت نشط" : "متصل بالإنترنت";
  };
  const showInstallHelp = () => {
    if (!networkStatus) return;
    const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    networkStatus.textContent = isAppleMobile
      ? "للتثبيت: افتح مشاركة Safari ثم «إضافة إلى الشاشة الرئيسية»."
      : "للتثبيت: افتح قائمة المتصفح (⋮) واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».";
    networkStatus.classList.remove("is-offline");
  };
  const updateInstallVisibility = () => { if (installButton) installButton.hidden = isStandalone(); };
  if (installButton) {
    updateInstallVisibility();
    installButton.addEventListener("click", async () => {
      if (!deferredInstallPrompt) { showInstallHelp(); return; }
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; }
      finally { deferredInstallPrompt = null; }
    });
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallVisibility();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallVisibility();
    if (networkStatus) networkStatus.textContent = "تم تثبيت التطبيق بنجاح";
  });
  window.addEventListener("online", setNetworkStatus);
  window.addEventListener("offline", setNetworkStatus);
  setNetworkStatus();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .catch((error) => console.error("PWA service worker registration failed:", error));
    });
  }
})();
