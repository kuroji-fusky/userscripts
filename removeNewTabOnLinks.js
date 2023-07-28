// ==UserScript==
// @name         No New Tabs PLEASE
// @version      0.1
// @description  Removes new tab behavior from links on Etsy pages
// @author       Kuroji Fusky
// @grant        none
// ==/UserScript==

;(function () {
  // Function to remove target attribute from links
  const removeTargetAttributes = () => {
    const linkMatches = [
      `a[target^="etsy"]`,
      `a[target="_blank"]:not([href^="/social"])`,
    ]

    linkMatches.map((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.removeAttribute("target")
      })
    })
  }

  // Create MutationObserver to detect DOM changes
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" || mutation.type === "subtree") {
        // Re-execute the function to remove target attributes
        removeTargetAttributes()
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  removeTargetAttributes()
})()
