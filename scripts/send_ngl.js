document.getElementById("send_btn").addEventListener("click", async () => {
  const ngl = document.getElementById("ngl").value;

  try {
    // FingerprintJS yükle ve cihaz ID çek
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const deviceId = result.visitorId;

    const res = await fetch("/api/sendMessage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ngl, fingerprint: deviceId }) // fingerprint
    });

    const resultJson = await res.json();

    if (!res.ok) {
      document.querySelector(".down_note").innerText = (resultJson.error || "Something went wrong.");
    } else {
      document.querySelector("#background section").remove();
      document.querySelector("#background input").remove();
      document.querySelector("#background h3").innerText = "Thanks To Your NGL!";
      document.querySelector("#background").style.height = "50px";
    }
  } catch (err) {
    console.error("Message error:", err);
  }
});
