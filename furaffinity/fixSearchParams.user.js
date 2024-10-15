// ==UserScript==
// @name         Fix Search URL Params
// @description  Adds back a sharable URL containing search parameters on FurAffinity
// @version      2024-07-20
// @author       Kuroji Fusky
// @match        https://www.furaffinity.net/search/*
// @icon         https://www.google.com/s2/favicons?sz=128&domain=furaffinity.net
// @grant        none
// ==/UserScript==
(function () {
  "use strict"
  function _$(s) {
    return document.querySelector(s)
  }

  function _serializeAsParams(o) {
    return Object.entries(o)
      .map(([k, v], i) => {
        return `${i === 1 ? "&" : "?"}${k}=${encodeURIComponent(v)}`
      })
      .join("")
  }

  const BASE_SEARCH_URL = `${location.protocol}//${location.hostname}${location.pathname}`

  const selectors = {
    formContainer: `form#search-form`,
    formSearchBox: `from#searchbox`,

    // Search inputs
    navSearchInput: `nav#ddmenu input[name="q"]`,

    sidebarSearchInput: `.sidebar-browse-container .browser-sidebar-search-box input`,
    sidebarSearchButton: `.sidebar-browse-container .browser-sidebar-search-box button`,

    // ! This is only shown if no query is provided on mobile viewports
    gallerySearchInput: `.gallery-section input[name="q"]`,

    // Sort criteria
    criteriaOrderBy: `select[name="order-by"]`,
    criteriaOrderDirection: `select[name="order-direction"]`,

    // Range
    rangeInputs: `.gridContainer:nth-child(1) .gridContainer__item input`,

    // Ratings
    ratingInputs: `.gridContainer:nth-child(3) .gridContainer__item input`,

    // Submission type
    submissionTypeInputs: `.gridContainer:nth-child(4) .gridContainer__item input`,

    // Matching keywords
    matchingKeywordInputs: `.gridContainer:nth-child(5) .gridContainer__item input`,
  }

  // Strip form actions
  const formSelectors = [selectors.formSearchBox, selectors.formContainer]

  formSelectors.forEach((selector) => {
    const formElement = _$(selector)
    if (!formElement) return

    formElement.removeAttribute("method")
    formElement.removeAttribute("action")
  })

  // Override events
  const searchInputSelectors = [
    selectors.sidebarSearchInput,
    selectors.gallerySearchInput,
    selectors.navSearchInput,
  ]

  const overrideSearchParamInput = (e) => {
    if (e.key === "Enter") {
      // This is to prevent inputs from forms from sending a request
      e.preventDefault()

      console.log(e.target.value)

      return false
    }
  }

  searchInputSelectors.forEach((selector) => {
    const inputElement = _$(selector)
    if (!inputElement) return

    console.log("mounting selector", selector)

    inputElement.addEventListener("keydown", overrideSearchParamInput)
  })
})()
