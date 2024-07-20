// ==UserScript==
// @name         Fix Search Params
// @description  Adds back a sharable URL containing search parameters on FurAffinity
// @version      2024-07-20
// @author       Kuroji Fusky
// @match        https://www.furaffinity.net/*
// ==/UserScript==
"use strict"
/**
 * @typedef FASearchParams
 * @prop {"1" | null=} rating-general
 * @prop {"1" | null=} rating-mature
 * @prop {"1" | null=} rating-adult
 * @prop {"1" | null=} type-art
 * @prop {"1" | null=} type-music
 * @prop {"1" | null=} type-photos
 * @prop {"1" | null=} type-flash
 * @prop {"1" | null=} type-story
 */

const parseItems = () => {}
const compareObjectToUrl = () => {}

// =========================================
// Entry point
// =========================================
;(function () {
  const __d = document

  const { pathname: _path } = window.location

  const isSearchRoute = _path.includes("/search")
  const isBrowseRoute = _path.includes("/browse")

  // default values
  const searchDefaults = {}
  /** @type {FASearchParams} */
  const browseDefaults = {
    do_search: "Search",
    "order-by": "relevancy",
    "order-direction": "desc",
    range: "5years",
    range_from: "",
    range_to: "",
    "rating-general": "1",
    "rating-mature": null,
    "rating-adult": null,

    "type-art": "1",
    "type-music": "1",
    "type-photos": "1",
    "type-flash": "1",
    "type-story": "1",

    mode: "extended",
  }

  const searchSidebarEl = __d.querySelector(".sidebar-browse-container")

  const handleRouteShits = () => {
    if (isBrowseRoute) {
      console.log("browse page", searchSidebarEl)
    }

    if (isSearchRoute) {
      console.log("search page", searchSidebarEl)
    }
  }

  handleRouteShits()

  // Retrigger event from navigation
  window.addEventListener("pageshow", handleRouteShits)
})()
