// ==UserScript==
// @name         Better Stats For Nerds
// @description  Improve Stats for Nerds UI
// @version      1
// @grant        none
// @author       Kuroji Fusky
// @match        https://www.youtube.com/*
// ==/UserScript==
;(function () {
  /* ================= HELPER FUNCTIONS ================= */
  const selectElement = (selector) => document.querySelector(selector)

  const selectAllElements = (selector) => document.querySelectorAll(selector)

  /* ================= DOM CREATORS  ================= */

  const handleStatsForNerdsUI = (event) => {
    const response = event.detail.response
    const isWatchPage = response.page === "watch"
  }

  window.addEventListener("yt-navigate-finish", handleStatsForNerdsUI)
})
