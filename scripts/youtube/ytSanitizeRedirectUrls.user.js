// ==UserScript==
// @name         Sanitize YT Redirect URLs
// @version      0.1
// @description  Cleans off redirects from links on YouTube
// @author       Kuroji Fusky
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

;(function () {
  const links = document.querySelectorAll(
    'a[href^="https://www.youtube.com/redirect?"]',
  )

  const filterNullItems = (a) => {
    return a.filter((item) => !!item)
  }

  const filteredLinks = Array.from(links).map((link) => {
    const hasRedirect = link.href.startsWith(
      "https://www.youtube.com/redirect?",
    )

    if (hasRedirect) return link
  })

  filterNullItems(filteredLinks).forEach((link) => {
    // Remove any redirect links, possibly for analytics for outbound links
    const stripRedirect = link.href.split("&q=").at(-1)

    // Strip any "&v=" params for link shorteners
    const hasVParam = stripRedirect.includes("&v=")
    const decodedLink = decodeURIComponent(
      !hasVParam ? stripRedirect : stripRedirect.split("&v=")[0],
    )

    // Add "https://" if link doesn't have any
    const parsedLink = decodedLink.startsWith("http")
      ? decodedLink
      : `https://${decodedLink}`

    console.log(parsedLink)
  })
})()
