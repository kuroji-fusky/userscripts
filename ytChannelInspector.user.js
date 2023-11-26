// ==UserScript==
// @name         YT Channel Inspector
// @description  Creates a new  button from a channel page to get in-depth channel metadata na dother functionalities
// @version      1.1
// @grant        none
// @author       Kuroji Fusky
// @match        https://www.youtube.com/*
// ==/UserScript==
;(function () {
  const debugLog = (...msg) =>
    console.debug(
      `%c[Channel Inspect — Debug]%c`,
      "color:#30a7d4;font-weight: 800",
      "color:currentColor",
      ...msg
    )

  /* ================= HELPER FUNCTIONS ================= */
  const createElement = (tag, { id, className }) => {
    const element = document.createElement(tag)
    if (id) element.id = id
    if (className) element.className = className

    return element
  }

  const selectElement = (selector) => document.querySelector(selector)

  const concatItems = (...items) => items.filter(Boolean).join("")

  const arrIndex = (item, index = -1) => item.at(index)

  const urlSplitLast = (str) => arrIndex(str.split("/"))

  const $body = document.body

  /* ================= GLOBAL STYLES ================= */
  const _inlineStyles = createElement("style", {
    id: "__kuro-custom-yt-styles",
  })

  _inlineStyles.textContent = `
    :root {
      --font: Roboto, Arial, sans-serif;
      --font-500: 500;
      --weight-button: var(--font-500);
      --button-idle: #a9e0fa;
      --button-hover: #75d3ff;
    }
    .__kuro-wrapper {
      position: relative;
    }
    .__kuro-button-scope {
      padding: 0 1.5rem;
      border: none;
      border-radius: 2rem;
      background: none;
      font-family: var(--font);
      font-weight: var(--weight-button);
      margin: 0 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.33rem;
    }
    .__kuro-metadata {
      background: var(--button-idle);
    }
    .__kuro-metadata:hover {
      background: var(--button-hover);
    }
    .__kuro-hidden {
      display: none !important;
    }
    .__kuro-channel-options-modal {
      background: white;
      border-radius: 1.66rem;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      box-shadow: 0 0 21px rgba(0, 0, 0, 0.22);
      padding: 1rem;
      z-index: 9999;
      font-size: 16px;
      font-weight: var(--font);
    }
  `
  /* ================= SVG ICONS BY LUCIDE ================= */
  const icons = {
    chevronDown: `<path d="m6 9 6 6 6-6"/>`,
    banner: `<path d="M3 2h18"/><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M3 22h18"/>`,
    avatar: `<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>`,
  }

  const iconMerge = (htmlString) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      ${htmlString}
    </svg>`

  /* ================= MODAL ================= */
  const optionsModal = createElement("div", {
    className: "__kuro-channel-options-modal __kuro-hidden",
  })

  optionsModal.innerHTML = `
    <kuro-tab-container>TABS LOL</kuro-tab-container>
    <kuro-tab-view>MARRY ME</kuro-tab-view>
  `

  /* ================= METADATA BUTTON ================= */
  let isMenuOpen = false

  const metadataButton = createElement("button", {
    className: "__kuro-button-scope __kuro-metadata",
  })

  metadataButton.innerHTML = concatItems(
    "Options",
    iconMerge(icons.chevronDown)
  )

  let isOpenMenuFirstTime = false

  const handleModalState = () => {
    const selectDOMTargetBounds = (event) => {
      const DOMTarget = event.target

      return !(DOMTarget === element) && !(DOMTarget.parentElement === element)
    }

    const containsModalTarget = selectDOMTargetBounds(optionsModal)
    const containsBtnTarget = selectDOMTargetBounds(metadataButton)

    // A safe-guard to prevent the dialog from immediately closing
    // Then set to false afterwards
    if (isOpenMenuFirstTime) {
      isOpenMenuFirstTime = false
      return
    }

    if (!(containsBtnTarget && !containsModalTarget)) {
      console.log("Trigger menu close")
      isMenuOpen = false
    }
  }

  metadataButton.addEventListener("click", () => {
    isMenuOpen = !isMenuOpen

    optionsModal.classList.toggle("__kuro-hidden")

    if (isMenuOpen) {
      isOpenMenuFirstTime = true
      window.addEventListener("click", handleModalState)
    } else {
      window.removeEventListener("click", handleModalState)
    }
  })

  // Mount styles and modals to my <body>
  $body.prepend(_inlineStyles, optionsModal)

  const handleModalKeys = (event) => {
    console.log(event)
  }

  /* ================= YT CHANNEL DATA ================= */
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
