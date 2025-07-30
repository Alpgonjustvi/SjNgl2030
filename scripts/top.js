Array.from(document.querySelector(".top").children).forEach(li => {
  const headtext = li.innerText
  const pathname = "/" + headtext.toLowerCase().replace(/\s+/g, "_");

  if (window.location.pathname != pathname) {
    if (window.location.pathname == "/" && pathname == "/send_ngl"){}
    else {
      li.classList.add("other")
    }
  }

  li.addEventListener("click", () => {
    window.location.pathname = pathname
  })

})
