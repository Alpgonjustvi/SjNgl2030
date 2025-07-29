fetch('/api/profile', {
  method: 'GET',
  credentials: 'include' // 🍪
})
  .then(res => {
    if (!res.ok) throw new Error("unauthorized");
    return res.json();
  })
  .then(() => {


    async function getUserByFingerprint(fingerprint) {
      const res = await fetch(`/api/user/${fingerprint}`);
      if (!res.ok) throw new Error("User bulunamadı");
      return await res.json();
    }



    //get the messages as list
    async function loadMessages() {
      try {
        const res = await fetch("/api/messages");
        const messages = await res.json();

        const list = document.getElementById("messages");
        list.innerHTML = "";


        const svgNS = "http://www.w3.org/2000/svg";

        // SVG oluştur



        messages.forEach(async msg => {

          const userData = await getUserByFingerprint(msg.fingerprint);

          const svg = document.createElementNS(svgNS, "svg");
          svg.setAttribute("width", "30px");
          svg.setAttribute("height", "30px");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("xmlns", svgNS);

          // PATH'leri oluştur
          const paths = [
            "M10 11V17",
            "M14 11V17",
            "M4 7H20",
            "M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z",
            "M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
          ];

          paths.forEach(d => {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", d);
            path.setAttribute("stroke", "#FF0000");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            svg.appendChild(path);
          });

          // SVG1 oluştur
          const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg1.setAttribute("width", "30");
          svg1.setAttribute("height", "30");
          svg1.setAttribute("viewBox", "0 0 24 24");
          svg1.setAttribute("fill", "none");
          svg1.setAttribute("xmlns", "http://www.w3.org/2000/svg");

          // PATH1'leri oluştur
          const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path1.setAttribute("d", "M18.364 5.63604C19.9926 7.26472 21 9.51472 21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364M18.364 5.63604C16.7353 4.00736 14.4853 3 12 3C7.02944 3 3 7.02944 3 12C3 14.4853 4.00736 16.7353 5.63604 18.364M18.364 5.63604L5.63604 18.364");
          path1.setAttribute("stroke", userData.blocked ? "#00000099" : "#FF0000");
          path1.setAttribute("stroke-width", "2.4");
          path1.setAttribute("stroke-linecap", "round");
          path1.setAttribute("stroke-linejoin", "round");
          svg1.appendChild(path1);

          // body'e ekle


          svg.addEventListener("click", () => {
            window.location.hash = `#${msg._id}`
            fetch(`/api/messages/${msg._id}`, {
              method: "DELETE"
            })
              .then(res => {
                if (!res.ok) throw new Error("Silinemedi");
                return res.json();
              })
              .then(data => {
                console.log("Silindi:", data);
                window.location.reload()
              })
              .catch(err => console.error(err));
            window.location.reload()
          })

          svg1.addEventListener("click", () => {
            window.location.href = `/block_user#${msg.fingerprint}`;
          });




          const li = document.createElement("li");
          li.style.display = "flex";
          svg.style.flexShrink = "0";
          li.style.padding = "2px"
          svg.style.marginRight = "10px"
          if (userData.blocked) {
            li.style.backgroundColor = "rgba(240, 248, 255, 0.25)";
            li.style.color = "#00000099"
            li.style.textDecoration = "line-through"
          }
          li.style.display = "flex";
          svg1.style.flexShrink = "0";
          svg1.style.marginRight = "0px"
          li.dataset.id = msg._id;

          // Text node oluştur
          const text = document.createTextNode(msg.ngl);

          // Önce svg'yi, sonra text'i ekle
          li.append(svg1);
          li.append(svg); 
          li.append(text);

          list.appendChild(li);


          li.addEventListener("click", () => {
            window.location.hash = `#${msg._id}`
          })
        });
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    }

    // Sayfa yüklenince çek
    loadMessages();


  })
  .catch((err) => {
    //alert(err)
    window.location.href = "/login";
  });


async function checkMessageById(_id) {
  try {
    const res = await fetch(`/api/messages/${_id}`);
    if (!res.ok) {
      alert("Mesaj bulunamadı");
      window.location.reload()
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching message:", err);
    return null;
  }
}

async function run(hash) {
  if (!hash) return;
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  const selectedMessageObject = await checkMessageById(id);

  if (selectedMessageObject) {

    document.body.querySelectorAll("section")[0].style.display = "none"
    document.body.querySelectorAll("section")[1].style.display = "flex"

    const pageAlt = document.getElementById("altt")
    pageAlt.querySelector("#ngl_bg_bottom h3").innerText = selectedMessageObject.ngl

  } else {
    document.body.querySelectorAll("section")[1].style.display = "none"
    document.body.querySelectorAll("section")[0].style.display = "flex"
  }
}

window.addEventListener("hashchange", () => run(window.location.hash));



window.addEventListener("load", () => {
  history.replaceState(null, "", window.location.pathname + window.location.search);
})

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}


document.getElementById("shareBtn").addEventListener("click", async () => {
  const element = document.querySelector("#altt");
  const canvas = await html2canvas(element, { backgroundColor: "null" });
  const dataURL = canvas.toDataURL("image/png");

  // Yeni bir <img> oluştur
  const img = document.createElement("img");
  img.src = dataURL;
  img.alt = "Generated Image";
  img.style.maxWidth = "100%"; // responsive için

  // Önceki varsa temizle
  const container = document.getElementById("altt");
  container.innerHTML = "";
  container.appendChild(img);

  const down_note = document.querySelector(".down_note")
  if (down_note.innerText == "") {
    down_note.innerText = "NGL'yi basılı tutarak fotoğraflara kaydet ve tekrar butona bas. Daha sonra hikaye kısmına NGL'yi yapıştır"
    down_note.style.color = "darkgreen"
  } else {
    window.location.href = "instagram://story-camera";

    const id = window.location.hash.replace("#", "");

    if (id) {
      fetch(`/api/messages/${id}`, {
        method: "DELETE"
      })
        .then(res => {
          if (!res.ok) throw new Error("Silinemedi");
          return res.json();
        })
        .then(data => {
          console.log("Silindi:", data);
          window.location.href = "/messages";
        })
        .catch(err => console.error(err));
    }

  }

});

