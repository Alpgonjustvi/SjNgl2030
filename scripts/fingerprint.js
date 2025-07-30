(async () => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const deviceId = result.visitorId;
  
  try {
    const res = await fetch("/api/check-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    const data = await res.json();
    if (data.blocked) {
      document.body.style.display = "flex"
      document.body.style.flexDirection = "column"
      document.body.innerHTML = '<h1 style="color:red; margin:0" >🚫 Bu cihaz engellendi!</h1>';
      document.body.innerHTML += `<a style="width: 300px" >${deviceId}</a>`
      document.body.innerHTML += `<a style="width: 300px" >${data.block_purpose}</a>`  
    }
  } catch (e) {
    console.error("Device check error:", e);
  }
})();

