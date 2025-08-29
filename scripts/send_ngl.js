document.getElementById("send_btn").addEventListener("click", async () => {
  const ngl = document.getElementById("ngl").value;

  try {
    // FingerprintJS yükle ve cihaz ID çek
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const deviceId = result.visitorId;

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("event");

    console.log(eventId)

    const res = await fetch("/api/sendMessage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ngl, fingerprint: deviceId, eventId }) // fingerprint
    });

    const resultJson = await res.json();

    if (!res.ok) {
      document.querySelector(".down_note").innerText = (resultJson.error || "Something went wrong.");
    } else {
      document.querySelector("#background section").remove();
      document.querySelector("#background input").remove();

      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get("event");
      document.querySelector("#background h3").innerText = eventId ? "Thanks For Your Answer" : "Thanks To Your NGL!" ;
      document.querySelector("#background").style.height = "50px";
      document.querySelector(".down_note").innerText = ""
    }
  } catch (err) {
    console.error("Message error:", err);
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("event");
    if (eventId) {
      const res = await fetch("/api/getEvent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId }) // frontend ve backend isim aynı olmalı
      });

      const data = await res.json();
      if (!data.success) {
        document.getElementById("background").innerHTML = "<h3> Event Didn't Exist </h3>"
        document.querySelector("#background h3").addEventListener("click", () =>{
          const urlParams2 = new URLSearchParams(window.location.search);
          const eventId2 = urlParams.get("event");
        })
        document.querySelector("#background").style.height = "50px";
        alert(eventId)
      } else {
        document.body.querySelector("h3").innerText = data.event.name
        document.body.querySelector("input").placeholder = "Your answer"
        document.body.style.background = "linear-gradient(135deg, rgb(36, 120, 135), rgb(198, 198, 244))"
      }
    }
  } catch (err) {
    console.error("Event error:", err)
  }
});
