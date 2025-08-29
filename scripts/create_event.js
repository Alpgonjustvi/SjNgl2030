fetch('/api/profile', {
  method: 'GET',
  credentials: 'include'
})
  .then(res => {
    if (!res.ok) throw new Error("unauthorized");
    return res.json();
  })
  .then(data => {

    const fmt = d => d.toISOString().split("T")[0];

    const today = new Date();
    const minDate = fmt(today);

    const max = new Date();
    max.setDate(today.getDate() + 21); // +3 weeks
    const maxDate = fmt(max);

    // use template literals here in JS
    document.getElementById("when").setAttribute("min", `${minDate}`);
    document.getElementById("when").setAttribute("max", `${maxDate}`);

    document.getElementById("create_btn").addEventListener("click", async () => {

      const name = document.getElementById("eventName").value
      const expiresAt = new Date(document.getElementById("when").value);

      try {
        const res = await fetch("/api/create_event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, expiresAt }) // fingerprint
        });

        const resultJson = await res.json();

        if (!res.ok) {
          document.querySelector(".down_note").innerText = (resultJson.error || "Something went wrong.");
        } else {
          window.location.href = "/profile"
        }

      } catch (err) {
        console.error("Event error:", err);
      }
    });

  })
  .catch((err) => {
    //alert(err)
    window.location.href = "/login";
  });