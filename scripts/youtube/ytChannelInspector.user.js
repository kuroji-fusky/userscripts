// ==UserScript==
// @name         YT Channel Inspector
// @description  This script injects an additional button from a channel page to get in-depth channel metadata
// @version      1.1
// @grant        none
// @author       Kuroji Fusky
// @match        https://www.youtube.com/*
// ==/UserScript==
;(function () {
  "use strict"
  const debugLog = (...msg) =>
    console.debug(
      `%c[Channel Inspect — Debug]%c`,
      "color:#30a7d4;font-weight: 800",
      "color:currentColor",
      ...msg,
    )

  /* ================= HELPER FUNCTIONS ================= */
  const selectElement = (selector) => document.querySelector(selector)
  const arrIndex = (item, index = -1) => item.at(index)
  const urlSplitLast = (str) => str.split("/").at(-1)

  const ce = (tag, { id, className, ...otherAttrs }, contents) => {
    const svgNSTags = [
      "svg",
      "circle",
      "path",
      "g",
      "rect",
      "polygon",
      "polyline",
      "radialGradient",
      "linearGradient",
      "stop",
      "eclipse",
    ]

    const element = svgNSTags.includes(tag)
      ? document.createElementNS("http://www.w3.org/2000/svg", tag)
      : document.createElement(tag)

    if (id) element.id = id
    if (className) element.classList.add(className)

    if (otherAttrs) {
      Object.entries(otherAttrs).forEach(([k, v]) =>
        svgNSTags.includes(tag)
          ? element.setAttributeNS(null, k, v)
          : element.setAttribute(k, v),
      )
    }

    if (contents) {
      if (Array.isArray(contents)) contents.map((item) => element.append(item))
      if (!Array.isArray(contents)) element.textContent = contents
    }

    return element
  }

  /* ================= GLOBAL STYLES ================= */
  const _globalStyles = ce(
    "style",
    {},
    `
    .kuro-yt-inspect-button {
      background: #a9e0fa;
      border: none;
      border-radius: 2rem;
      font-family: Roboto, sans-serif;
      font-weight: 500;
      margin: 0 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.33rem;
      color: currentColor;
      stroke: currentColor;
      padding: 0 1.75rem;
    }
    .kuro-yt-inspect-button:hover {
      background: #75d3ff;
    }
  `,
  )
  /* ================= SVG ICONS ================= */
  const svgWrapper = (size = "24", icon) =>
    ce(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
      },
      icon,
    )

  // Icons provided by lucide.dev
  const icons = {
    chevronDown: [ce("path", { d: "m6 9 6 6 6-6" })],
    avatar: [
      ce("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
      ce("circle", { cx: "12", cy: "10", r: "3" }),
      ce("path", { d: "M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" }),
    ],
    close: [ce("path", { d: "M18 6 6 18" }), ce("path", { d: "m6 6 12 12" })],
    copy: [
      ce("rect", {
        width: "14",
        height: "14",
        x: "8",
        y: "8",
        rx: "2",
        ry: "2",
      }),
      ce("path", {
        d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
      }),
    ],
  }

  /* ================= MODAL CONTENTS START ================= */
  // Writing UIs in pure JavaScript is painful and error prone... and I love it (send help)
  // I really need to touch grass lol
  const _scopedStyles = ce(
    "style",
    {},
    `
    :host * {
      font-family: Roboto, sans-serif, system-ui;
    }
    button {
      background: none;
      border: none;
      cursor: pointer;
      color: currentColor;
    }
    button#close{
      transition: background-color 150ms ease;
    }
    button#close:hover {
      background-color: rgb(255 255 255 / 0.5);
    }
    #modal {
      display: none;
    }
    :host(.active) #modal {
      display: block;
    }
    #backdrop {
      transition: opacity 200ms ease;
      opacity: 0;
      pointer-events: none;
    }
    :host(.active) #backdrop {
      opacity: 1;
      pointer-events: auto;
    }
  `,
  )

  const inspectorModalRoot = ce("div", {
    className: "kuro-channel-inspector",
    style: "position: relative; z-index: 3000;",
  })

  const inspectorShadow = inspectorModalRoot.attachShadow({ mode: "open" })

  const tabItem = (name) =>
    ce("button", { class: "kuro-tab-item", style: `padding: 0.5rem` }, name)

  const closeBtn = ce(
    "button",
    {
      id: "close",
      style: `border-radius: 50%;`,
    },
    [svgWrapper("28", icons.close)],
  )

  const titleBar = ce(
    "div",
    {
      style: `display: flex; justify-content: space-between; align-items: center;`,
    },
    [
      ce(
        "div",
        {
          style: `display: flex; column-gap: 0.1rem`,
        },
        [tabItem("Channel info"), tabItem("Others"), tabItem("Raw data")],
      ),
      closeBtn,
    ],
  )

  // ==================== Inspect tab ===================-- //
  const inspectTab = ce("div", { className: "inspect-tab" }, ["Inspect lmao"])

  // ==================== Others tab ===================-- //
  const otherTab = ce("div", { className: "inspect-tab" }, ["Others lmao"])

  // ==================== Raw data tab ===================-- //
  const rawDataTab = ce("div", { className: "inspect-tab" }, ["Raw data lmao"])

  const _modalContainer = ce(
    "div",
    {
      id: "modal",
      style: `
      position: fixed;
      z-index: 2;
      inset: 50% 0 0 50%;
      transform: translate3d(-50%, -50%, 0);
      border-radius: 0.75rem;
      background: #2e2e2e;
      color: #e7e7e7;
      padding: 1.25rem;`,
    },
    [
      ce("div", {}, [titleBar]),
      ce("div", { style: `font-size: 1.66rem;` }, [
        inspectTab,
        otherTab,
        rawDataTab,
      ]),
    ],
  )

  const _backdrop = ce("div", {
    id: "backdrop",
    style: `
    background-color: rgb(0 0 0 / 0.33);
    position: fixed;
    inset: 0;
    z-index: 1;`,
  })

  inspectorShadow.append(_scopedStyles, _modalContainer, _backdrop)

  /* ================= MODAL CONTENTS END ================= */

  const closeInspectorModal = () => {
    inspectorModalRoot.classList.remove("active")
  }

  _backdrop.addEventListener("click", closeInspectorModal)
  closeBtn.addEventListener("click", closeInspectorModal)

  /* ================= INJECT METADATA BUTTON ================= */
  const metadataButton = ce(
    "button",
    {
      className: "kuro-yt-inspect-button",
    },
    [svgWrapper("24", icons.avatar), ce("span", {}, "Inspect channel")],
  )

  // Mount styles and modals to my <body>
  document.head.appendChild(_globalStyles)
  document.body.prepend(inspectorModalRoot)

  metadataButton.addEventListener("click", () => {
    inspectorModalRoot.classList.add("active")
  })

  window.addEventListener("keydown", (e) => {
    if (inspectorModalRoot.classList.contains("active") && e.key == "Escape") {
      closeInspectorModal()
    }
  })

  /* ================= YT CHANNEL DATA ================= */
  const handleModalKeys = (event) => {
    console.log(event)
  }

  let debounceChannelId = ""

  const handleChannelData = (event) => {
    const response = event.detail.response

    const isChannelPage = response.page === "channel"

    // Remove keydown listeners if there are any prior visiting the channel page
    if (!isChannelPage) {
      debugLog("Keydown event listener removed")
      window.removeEventListener("keydown", handleModalKeys)
      return
    }

    window.addEventListener("keydown", handleModalKeys)

    const {
      header: { c4TabbedHeaderRenderer: _header },
      metadata: { channelMetadataRenderer: _metadata },
    } = response.response

    const channelName = _header.title
    const channelAvatar = arrIndex(_metadata.avatar.thumbnails, 0).url
    const hasChannelbanner = _header.banner

    const channelBanner = hasChannelbanner
      ? arrIndex(_header.banner.thumbnails).url
      : "none"

    const channelBannerFull = hasChannelbanner
      ? arrIndex(_header.tvBanner.thumbnails).url
      : "none"

    const channelVideos = _header.videosCountText
      ? arrIndex(_header.videosCountText.runs, 0)
      : 0

    const setFullRes = (string, splitter) => {
      return `${arrIndex(string.split(splitter), 0)}${splitter}9999`
    }

    const channelData = {
      imgBanner: channelBanner,
      imgBannerFull: channelBannerFull,
      imgBannerFullHighRes: setFullRes(channelBannerFull, "=w"),
      imgAvatar: channelAvatar,
      imgAvatarHighRes: setFullRes(channelAvatar, "=s"),
      channelIdUrl: _metadata.channelUrl,
      channelId: urlSplitLast(_metadata.channelUrl),
      channelName,
      channelHandle: urlSplitLast(_metadata.vanityChannelUrl),
      channelDescription: _metadata.description,
      channelVideos,
      channelSubs: _header.subscriberCountText.simpleText,
    }

    if (
      debounceChannelId === "" ||
      channelData.channelId !== debounceChannelId
    ) {
      if (!hasChannelbanner) debugLog(`No banner detected for ${channelName}`)

      debounceChannelId = channelData.channelId
      debugLog("Debounce pass")
    }

    const channelButtonContainer = selectElement("#channel-container #buttons")

    if (isChannelPage && channelButtonContainer) {
      channelButtonContainer.appendChild(metadataButton)
    }

    debugLog("Data response", channelData)
  }

  window.addEventListener("yt-navigate-finish", handleChannelData)
})()
