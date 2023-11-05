// ==UserScript==
// @name         YT Channel Inspector
// @description  This script injects an additional button from a channel page to get in-depth channel metadata
// @version      1
// @grant        none
// @author       Kuroji Fusky
// @match        https://www.youtube.com/*
// ==/UserScript==
;(function () {
  const body = document.body

  const debugLog = (...msg) => {
    return console.debug(
      `%c[Channel Inspect - Debug]%c`,
      "color:#30a7d4;font-weight: 800",
      "color:currentColor",
      ...msg
    )
  }

  /* ================= HELPER FUNCTIONS ================= */
  const createElement = (tag, { id, className }) => {
    const element = document.createElement(tag)
    if (id) element.id = id
    if (className) element.className = className

    return element
  }

  const selectElement = (selector) => document.querySelector(selector)

  const concatItems = (...items) => items.filter(Boolean).join("")

  /* ================= GLOBAL STYLES ================= */
  const _inlineStyles = createElement("style", {
    id: "__kuro-custom-yt-styles",
  })

  _inlineStyles.textContent = `
    :root {
      --font: Roboto, Arial, sans-serif;
      --font-500: 500;
      --weight-button: var(--font-500);

			--button-idle:;
			--button-
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
			height: 100%;
    }
    .__kuro-metadata {
    	background: #a9e0fa;
    }
    .__kuro-metadata:hover {
    	background: #75d3ff;
    }
		.__kuro-metadata-menu-container {
			position: absolute;
      border-radius: 1.66rem;
			left: 0.5rem;
      background: white;
		}
  `

  body.prepend(_inlineStyles)

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

  /* ================= MENU STUFF ================= */
  let isMenuOpen = false

  const menuContainer = createElement("div", {
    className: "__kuro-metadata-menu-container",
  })

  // Hide element on initial load
  window.addEventListener("load", () => (menuContainer.style.display = "none"))

  menuContainer.innerHTML = `<div>Ulol mo</div>`

  /* ================= METADATA BUTTON ================= */
  const metadataButton = createElement("button", {
    className: "__kuro-button-scope __kuro-metadata",
  })

  metadataButton.innerHTML = concatItems(
    "Options",
    iconMerge(icons.chevronDown)
  )

  metadataButton.addEventListener("click", () => {
    isMenuOpen = !isMenuOpen

    !isMenuOpen
      ? (menuContainer.style.display = "none")
      : (menuContainer.style.display = "block")
  })

  /* ================= WRAPPER ================= */
  const wrapper = createElement("div", {
    className: "__kuro-wrapper",
  })

  wrapper.prepend(metadataButton, menuContainer)

  /* ================= GET CHANNEL DATA  ================= */
  let debounceChannelId = ""

  const handleChannelData = (ev) => {
    const response = ev.detail.response

    const isChannelPage = response.page === "channel"
    if (!isChannelPage) return

    const {
      header: { c4TabbedHeaderRenderer: _header },
      metadata: { channelMetadataRenderer: _metadata },
    } = response.response

    const channelName = _header.title
    const hasChannelbanner = _header.banner

    const channelBanner = hasChannelbanner
      ? _header.banner.thumbnails.at(-1).url
      : "none"

    const channelBannerFull = hasChannelbanner
      ? _header.tvBanner.thumbnails.at(-1).url
      : "none"

    const channelAvatar = _metadata.avatar.thumbnails.at(0).url

    const channelData = {
      imgBanner: channelBanner,
      imgBannerFull: channelBannerFull,
      // Split the url and append to a high quality image by modifying its complicated positional arguments
      imgAvatar: `${channelAvatar.split("=s").at(0)}=s9999`,
      channelIdUrl: _metadata.channelUrl,
      channelId: _metadata.channelUrl.split("/").at(-1),
      channelName: _header.title,
      channelHandle: _metadata.vanityChannelUrl.split("/").at(-1),
      channelDescription: _metadata.description,
      channelVideos: _header.videosCountText.runs.at(0).text,
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
      channelButtonContainer.appendChild(wrapper)

      const metaRekt = metadataButton.getBoundingClientRect()
      menuContainer.style.top = `${metaRekt.height + 12}px`
    }

    debugLog("Data response", channelData)
  }

  window.addEventListener("yt-navigate-finish", handleChannelData)
})()
