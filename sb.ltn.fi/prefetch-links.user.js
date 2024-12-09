// ==UserScript==
// @name         Prefetch SBbrowser links
// @version      2024-09-22
// @description  try to take over the world!
// @author       Kuroji Fusky
// @match        https://sb.ltn.fi/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ltn.fi
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let lazyPrefetchs = [];

  const _$$ = (s) => Array.from(document.querySelectorAll(s));

  const paginationContainer = _$$("ul.pagination a");
  const segmentSubmissions = _$$('tbody tr a:is([href^="/video"],[href^="/userid"])');
  const relativeLinks = _$$('a:is([href^="/"], [href^="/uuid"])');

  lazyPrefetchs.push(...relativeLinks, ...segmentSubmissions);

  const appendPreloadLink = (link) => {
    if (link === "") return

    const hasPreloadLink = document.querySelector(`link[href="${link}"]`) !== null;
    if (hasPreloadLink) return

    console.debug("Add prefetch link for", link)

    document.head.append(
      Object.assign(document.createElement("link"), {
        rel: "preload",
        href: link,
        as: "fetch",
      })
    );
  };

  paginationContainer.forEach((l) => appendPreloadLink(l.href));

  lazyPrefetchs.forEach((l) => {
    const handlePrefetchLinks = () => {
      const hasPreloadLink =
        document.querySelector(`link[href="${l.href}"]`) !== null;

      if (hasPreloadLink) {
        detachPrefetchEvent();
        return;
      }

      appendPreloadLink(l.href);
      detachPrefetchEvent();
    };

    const detachPrefetchEvent = () => {
      l.removeEventListener("mouseenter", handlePrefetchLinks);
    };

    l.addEventListener("mouseenter", handlePrefetchLinks);
    return;
  });
})();

