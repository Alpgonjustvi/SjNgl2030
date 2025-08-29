fetch('/api/profile', {
  method: 'GET',
  credentials: 'include'
})
  .then(res => {
    if (!res.ok) throw new Error("unauthorized");
    return res.json();
  })
  .then(data => {
    document.getElementById("greeting").textContent = `Welcome,\n ${data.user.username}!`;

    // 2FA durumu
    document.getElementById("twoFA_checkbox").checked = data.user.twoFA.enabled;

    document.getElementById("username").value = data.user.username
    document.getElementById("gmail").value = data.user.email
    document.getElementById("password").value = "********"





  })
  .catch((err) => {
    //alert(err)
    window.location.href = "/login";
  });

// 2FA checkbox toggle
document.getElementById("twoFA_checkbox").addEventListener("change", async (e) => {
  const enabled = e.target.checked;
  try {
    const res = await fetch("/api/twofa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ enabled })
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Something went wrong.");
    }
  } catch (err) {
    console.error("2FA toggle error:", err);
  }
});
//Logout
document.getElementById("logout_btn").addEventListener("click", () => {
  fetch('/api/logout', {
    method: 'POST',
    credentials: 'include'
  }).then(() => {
    window.location.href = "/login";
  });
});


function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

// UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Reset "ALL" trusted devices //////////////////
async function resetAllTrustedDevices() {
  if (!confirm("Are you sure you want to remove ALL trusted devices?")) return;

  let v = ""

  const res = await fetch('/middleware/deleteTrusted', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ v }),
  });
  const data = await res.json();

  if (res.ok) {
    alert('All trusted devices have been reset.');
  } else {
    alert('Error: ' + data.error);
  }
}

// Reset CURRENT device only //////////////////
async function resetThisDevice() {
  const deviceId = getDeviceId();

  if (!deviceId) {
    alert("No device ID found.");
    return;
  }

  if (!confirm("Are you sure you want to remove this device from trusted devices?")) return;

  const res = await fetch('/middleware/deleteTrusted', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ deviceId }),
  });
  const data = await res.json();

  if (res.ok) {
    alert('This device has been removed from trusted devices.');
  } else {
    alert('Error: ' + data.error);
  }
}


const buttons = document.querySelectorAll("#resetAllDevice, #removeThisDevice");

buttons[0].addEventListener("click", resetAllTrustedDevices);
buttons[1].addEventListener("click", resetThisDevice);

document.getElementById("seeMessages").addEventListener("click", () => {
  window.location.pathname = "/messages"
})



window.addEventListener("DOMContentLoaded", async () => {
const res = await fetch("/api/getEventCount");
const data = await res.json();

if (data.count >= 1) {
  document.getElementById("createEvent").style.backgroundColor = "rgba(255,255,255,0.25)"
  document.getElementById("createEvent").style.color = "rgba(0,0,0,0.25)"
  document.getElementById("createEvent").style.cursor = "not-allowed"
  document.getElementById("createEvent").innerText = "Event Already Active"
  document.getElementById("createEvent").outerHTML += `<a href="/?event=${data.event._id}">Share Event Link</a>`
} else {
  document.getElementById("createEvent").addEventListener("click", () => {
    window.location.pathname = "/create_event"
  })
}
})