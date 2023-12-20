// ==UserScript==
// @name         Cloudflare WAF Extractor
// @description  Extracts WAF events from Cloudflare dashboard
// @version      1
// @grant        none
// @author       Kuroji Fusky
// @match        https://dash.cloudflare.com/*
// ==/UserScript==
;(function () {
  "use strict"

  const observerOptions = {
    childList: true,
    subtree: true,
  }

  let currentHref = window.location.href

  const detectUrlChanges = () => {
    const newHref = window.location.href
    const isHrefOld = currentHref !== newHref

    if (isHrefOld) {
      currentHref = newHref
    }

    const secEventsUrl = currentHref.endsWith("/security/events")

    if ((isHrefOld && secEventsUrl) || secEventsUrl) {
      console.log("OH YEAH THAT'S THE GOOD STUFF")
    }
  }

  const rootObserver = new MutationObserver(detectUrlChanges)

  rootObserver.observe(document.querySelector("body"), observerOptions)

  detectUrlChanges()
})()
