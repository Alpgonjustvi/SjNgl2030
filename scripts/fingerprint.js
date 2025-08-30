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
      document.body.innerHTML += `<a style="width: 300px; word-wrap: break-word" >block_purpose: "${data.block_purpose}"</a>`
      document.body.innerHTML += `<div style="max-width: 330px; word-wrap: break-word; font-size: 12px; text-align: center; margin-top: 20px">Engeli kaldırmak için<a href="mailto:saintjoseph2030@gmail.com"> saintjoseph2030@gmail.com </a> adresine ya da site kurucusuna bu ekranı atın. Gerekli görülürse engel açılır. "Ekrandaki verilerin değiştirilmesi, kopyalanması veya başkasıymış gibi gösterilmesi" takip edilebilir ve engel açma prosedürünü 1 yıllığına sekteye uğratır.</div>`

    }
  } catch (e) {
    console.error("Device check error:", e);
  }
})();

