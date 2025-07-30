fetch('/api/profile', {
	method: 'GET',
	credentials: 'include'
})
	.then(res => {
		if (!res.ok) throw new Error("unauthorized");
		return res.json();
	})
	.then(() => {
		document.querySelector("h3").innerText += ` ${window.location.hash.split("?")[0]}`


		async function getUserByFingerprint(fingerprint) {
			const res = await fetch(`/api/user/${fingerprint}`);
			if (!res.ok) throw new Error("User bulunamadı");
			return await res.json();
		}

		async function loadMessages() {
			try {
				const res = await fetch("/api/messages");
				const messages = await res.json();

				const list = document.getElementById("messages");
				list.innerHTML = "";
				const svgNS = "http://www.w3.org/2000/svg";


				messages.forEach(async msg => {
					if (msg.fingerprint == window.location.hash.split("?")[0].replace("#", "")) {


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

						svg.addEventListener("click", () => {
							window.location.hash.split("?")[0] = `#${msg._id}`
							fetch(`/api/messages/${msg._id}`, {
								method: "DELETE"
							})
								.then(res => {
									if (!res.ok) throw new Error("Silinemedi");
									return res.json();
								})
								.then(data => {
									console.log("Silindi:", data);
									window.location.hash.split("?")[0] = msg.fingerprint
									window.location.reload()
								})
								.catch(err => console.error(err));
							window.location.hash.split("?")[0] = msg.fingerprint
							window.location.reload()
						})

						const li = document.createElement("li");
						li.style.display = "flex";
						li.style.display = "flex";
						li.dataset.id = msg._id;
						if (msg._id == window.location.hash.split("?")[1]) {
							li.style.border = "1px solid red"
						}
						const text = document.createTextNode(msg.ngl);
						svg.style.flexShrink = "0";
						svg.style.marginRight = "10px"
						li.append(svg);
						li.append(text);

						list.appendChild(li);


					}
				})
			} catch (err) {
				console.error("Error loading messages:", err);
			}

			const user = await getUserByFingerprint(window.location.hash.split("?")[0].replace("#", ""))
			if (user.blocked) {
				document.querySelector("#blockBtn").style.backgroundColor = "#00000099"
				document.querySelector("#blockBtn").innerText = "Cihaz Engellenmiş"
				document.querySelector("#blockBtn").style.cursor = "not-allowed"
			}

			document.querySelector("#blockBtn").addEventListener("click", () => {
				if (!user.blocked) {
					fetch('/api/block-device', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							deviceId: window.location.hash.split("?")[0].replace("#", ""), // burada deviceId'yi gönder
							msgId: window.location.hash.split("?")[1]
						})
					})
						.then(res => {
							if (!res.ok) throw new Error('İstek başarısız!');
							return res.json();
						})
						.then(data => {
							console.log('Cihaz bloklandı:', data);
							window.location.href = "/messages"
						})
						.catch(err => {
							console.error('Hata:', err);
							alert('Cihaz bloklanamadı!');
						});
				}
			})
		}

		loadMessages()
	})
	.catch((err) => {
		//alert(err)
		window.location.href = "/login";
	});

