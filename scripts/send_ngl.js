



window.addEventListener("DOMContentLoaded", async () => {


  







  try {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("event");


    const res1 = await fetch("/api/getEventCount");
      const data1 = await res1.json();

      if (data1.count >= 1) {
        document.body.querySelector("section").outerHTML += `
    <span style="display: flex; align-items: center; gap: 5px; padding-top: 5px">
				<p>NGL</p>
				<label class="switch">
					<input id="toggleSwitch" type="checkbox">
					<span class="slider round"></span>
				</label>
				<p>Event</p>
			</span>`

        document.querySelector("#toggleSwitch").addEventListener("change", event => {
          if (event.target.checked) {
            document.body.style.background = "linear-gradient(135deg, rgb(36, 120, 135), rgb(198, 198, 244))";
            document.querySelector("h3").innerText = data1.event.name
            window.location.href = `/?event=${data1.event._id}`;
            
          } else {
            document.body.style.background = "linear-gradient(135deg, rgb(65, 65, 189), rgb(148, 148, 189))";
            document.querySelector("h3").innerText = "Send NGL To Saint Joseph 2030"
            window.location.href = `/`;
          }
        })
      }

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
        document.querySelector("#background").style.height = "50px";
      } else {
        document.body.querySelector("h3").innerText = data.event.name
        document.body.querySelector("input").placeholder = "Your answer"
        document.body.style.background = "linear-gradient(135deg, rgb(36, 120, 135), rgb(198, 198, 244))"
        document.querySelector("#toggleSwitch").checked = true 

      }
    }
  } catch (err) {
    console.error("Event error:", err)
  }




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
        document.querySelector("#background h3").innerText = eventId ? "Thanks For Your Answer" : "Thanks To Your NGL!";
        document.querySelector("#background").style.height = "50px";
        document.querySelector(".down_note").innerText = ""
      }
    } catch (err) {
      console.error("Message error:", err);
    }
  });
  
});


