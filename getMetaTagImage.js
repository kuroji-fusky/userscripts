document.querySelectorAll("meta").forEach((tag) => {
  let tagNodeValue = Object.values(tag.attributes)[0].nodeValue
  
  if (tagNodeValue === "og:image" || tagNodeValue === "twitter:image") {
    console.log(tag.attributes.content.nodeValue)
  }
})
