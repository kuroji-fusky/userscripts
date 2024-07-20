// ==UserScript==
// @name         Enhancements for SB Browser
// @version      2024-07-18
// @description  An enhancement for SBbrowser that has additional functionality such as colored segments and video titles and thumbnails via the YouTube Data API
// @author       Kuroji Fusky
// @match        https://sb.ltn.fi/*
// @icon         https://sb.ltn.fi/static/browser/logo.png
// ==/UserScript==
// @ts-check
"use strict"

const CURRENT_DATE = new Date()

const debugLog = (...msg) => console.debug("[sbb-debug]", ...msg)

const elementSelect = (selector, target = document) =>
  target.querySelector(selector)
const elementSelectAll = (selector, target = document) =>
  Array.from(target.querySelectorAll(selector))

const SECONDS = 60
const MILLISECONDS = 1000

const convertUTCToLocal = (dateStr) => {
  const initialDate = new Date(dateStr)
  const dateTZOffset = initialDate.getTimezoneOffset()

  const newDate = new Date(
    initialDate.getTime() + dateTZOffset * SECONDS * MILLISECONDS,
  )

  const offset = dateTZOffset / SECONDS
  const hours = initialDate.getHours()

  newDate.setHours(hours - offset)

  const localeOptions = /** @type {Intl.DateTimeFormatOptions} */ ({
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const localDate = newDate
    .toLocaleString("en-US", localeOptions)
    .replace(/\//g, "-")

  return localDate
}

const _cleanMultiStr = (str) =>
  str
    .trim()
    .split(/\r?\n|\t/)
    .map((s) => s.trim())
    .join("")

const createElement = (tag, attributes, contents) => {
  const alpha = "abcdefghijklmnopqrstuvwxyz".split("")

  const serialized = Math.floor(Math.random() * 2000 * 400)
    .toString(16)
    .padEnd(6, alpha[Math.floor(Math.random() * alpha.length)])

  const { style, ...otherAttrs } = attributes

  const element = Object.assign(
    document.createElement(tag),
    !style
      ? { ...otherAttrs }
      : { style: _cleanMultiStr(style), ...otherAttrs },
  )
  element.setAttribute(`kuro-ce-${serialized}`, "")

  if (contents) element.textContent = contents
  return element
}

/*********************
 *
 *  Entry point
 *
 *********************/
const currentPath = window.location.pathname

const route = /** @type {const} */ ({
  video: currentPath.startsWith("/video"),
  uuid: currentPath.startsWith("/uuid"),
  username: currentPath.startsWith("/username"),
  userid: currentPath.startsWith("/userid"),
  main: currentPath === "/",
})

;(function () {
  document.body.prepend(
    createElement(
      "style",
      {},
      `
      textarea {
        border: none !important;
        padding: none;
        resize: none;
      }
      textarea:hover {
        outline: none !important;
      }
      .segment-hidden {
        opacity: 0.33;
      }
      .segment-hidden:hover {
        opacity: 0.66;
      }
      `,
    ),
  )

  const tableRows = elementSelectAll("tbody tr")
  const columns = tableRows.map((el) => elementSelectAll("td", el))

  const YT_URL_LENGTH = 11

  /**
   * @typedef ParserOptions
   * @prop {number=} sliceEnd
   * @prop {true=} checkEmptyString
   *
   * @param {HTMLTableCellElement} element
   * @param {ParserOptions=} options
   * @returns {string | number | boolean | undefined}
   */
  const parseText = (element, options) => {
    if (typeof element === "undefined") return

    // Check if we're only checking for <td> element
    if (element.tagName.toLowerCase() !== "td") return
    if (!element.textContent) return

    const elementText = element.textContent?.trim()

    // Regex to replace emojis for voting section
    // \uD83D\uDD12 - 🔒
    // \uD83D\uDC51 - 👑
    // \u274C       - ❌
    const emojiRegex = /(?:\uD83D\uDD12|\uD83D\uDC51|\u274C)/gu
    const filteredText = elementText.replace(emojiRegex, "")

    if (options?.sliceEnd)
      return filteredText.toString().slice(0, options.sliceEnd)
    if (options?.checkEmptyString) return filteredText.toString() === ""

    if (!isNaN(/** @type {*} */ (filteredText))) return parseInt(filteredText)

    if (!options) return filteredText
  }

  /**
   * @typedef IncludeRef
   * @prop {string} text
   * @prop {Element} _ref
   *
   * @typedef TableData
   * @prop {Element} domTarget
   * @prop {string} dateSubmitted
   * @prop {IncludeRef | null} videoId
   * @prop {number} votes
   * @prop {string} views
   * @prop {IncludeRef} segment
   * @prop {boolean} isShadowHidden
   * @prop {boolean} isHidden
   */
  /** @type {TableData[]} */
  const parsedTableData = /** @returns {TableData[]} */ (function () {
    let mappedData = []

    // prettier-ignore
    const pushToMappedData = (domTarget, dateSubmitted, videoId, votes, views, segment, isShadowHidden, isHidden) => mappedData.push({
        domTarget,
        dateSubmitted,
        videoId,
        votes,
        views,
        segment,
        isShadowHidden,
        isHidden,
      })

    if (route.main)
      columns.forEach((col) => {
        const [
          date,
          id,
          ,
          ,
          ,
          votes,
          views,
          category,
          ,
          hidden,
          shadowhidden,
          ,
          ,
          ,
        ] = col
        // Table col order: date,id,start,end,length,votes,view,category,action,hidden,shadowhidden,uuid,user,userid
        const domTarget = date.parentElement
        pushToMappedData(
          domTarget,
          parseText(date),
          { text: parseText(id, { sliceEnd: YT_URL_LENGTH }), _ref: id },
          parseText(votes),
          parseText(views)?.toLocaleString(),
          { text: parseText(category), _ref: category },
          parseText(shadowhidden, { checkEmptyString: true }),
          parseText(hidden, { checkEmptyString: true }),
        )
      })

    if (route.username || route.userid)
      columns.forEach((col) => {
        const [
          date,
          id,
          ,
          ,
          ,
          votes,
          views,
          category,
          shadowhidden,
          ,
          ,
          hidden,
        ] = col
        // Table col order: date,id,start,end,length,votes,view,category,shadowhidden,uuid,action,hidden,userid
        const domTarget = date.parentElement
        pushToMappedData(
          domTarget,
          convertUTCToLocal(parseText(date)),
          { text: parseText(id, { sliceEnd: YT_URL_LENGTH }), _ref: id },
          parseText(votes),
          parseText(views)?.toLocaleString(),
          { text: parseText(category), _ref: category },
          parseText(shadowhidden, { checkEmptyString: true }),
          parseText(hidden, { checkEmptyString: true }),
        )
      })

    if (route.video || route.uuid)
      columns.forEach((col) => {
        const [
          date,
          ,
          ,
          ,
          votes,
          views,
          category,
          shadowhidden,
          ,
          ,
          hidden,
          ,
        ] = col
        // Table col order: date,start,end,length,votes,view,category,shadowhidden,uuid,username,action,hidden,userid
        const domTarget = date.parentElement
        pushToMappedData(
          domTarget,
          parseText(date),
          null,
          parseText(votes),
          parseText(views)?.toLocaleString(),
          { text: parseText(category), _ref: category },
          parseText(shadowhidden, { checkEmptyString: true }),
          parseText(hidden, { checkEmptyString: true }),
        )
      })

    return mappedData
  })()

  const parsedSBData = parsedTableData.map((rowItem) => {
    const { isHidden, isShadowHidden, ...others } = rowItem

    const isDownvoted = rowItem.votes <= -2
    const hideRowEntry = !(!isDownvoted && !isHidden && !isShadowHidden)

    return { ...others, hideRowEntry }
  })
  /*********************
   *
   *  The good stuff starts here
   *
   *********************/
  if (parsedSBData.length === 0) return

  parsedSBData.forEach(({ hideRowEntry, domTarget }) => {
    if (hideRowEntry) domTarget.classList.add("segment-hidden")
  })

  // Append proper titles
  if (route.username) {
    const username = elementSelect(".list-group .list-group-item:first-child")

    if (!username) return

    const filterNameStr = username.textContent.split(":").at("1")
    document.title = filterNameStr
  }

  // Taken from https://github.com/ajayyy/SponsorBlock/blob/master/src/config.ts#L387-L468
  const SB_SEGMENTS = {
    chapter: { text: "Chapter", color: "#fdfdfd" },
    sponsor: { text: "Sponsor", color: "#00d400" },
    selfpromo: { text: "Unpaid/Self Promotion", color: "#ffff00" },
    interaction: { text: "Interaction Reminder", color: "#6c0087" },
    intro: { text: "Intermission", color: "#00ffff" },
    outro: { text: "Endcards/Credits", color: "#0202ed" },
    preview: { text: "Preview/Recap/Hook", color: "#008fd6" },
    music_offtopic: { text: "Non-Music", color: "#ff9900" },
    poi_highlight: { text: "Highlight", color: "#ff1684" },
    filler: { text: "Filler Tangent", color: "#7300ff" },
    exclusive_access: { text: "Exclusive Access", color: "#008a5c" },
  }

  /***************************************************************
   *
   * Add colored segments on submission table
   *
   ***************************************************************/
  const segmentCSSProperties = Object.entries(SB_SEGMENTS)
    .map(([k, v]) => `.segment_${k}{--segment-color:${v.color};}`)
    .join("\n")

  const inlineSegmentStyles = `
  body > .container-fluid > .row:first-child {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  td.segment-cell {
    width: calc(1rem * 12.75);
  }
  [class^="segment_"] {
    padding: 0.25rem 0.75rem;
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    border-radius: 9999px;
    position: relative;
    overflow: hidden;
    width: 100%;
  }
  [class^="segment_"] #label {
    font-size: 14px;
    flex-shrink: 0;
  }
  [class^="segment_"]::before,
  [class^="segment_"]::after {
    content: '';
    background-color: var(--segment-color);
  }
  [class^="segment_"]::before {
    --size: 0.8rem;
    display: block;
    flex-shrink: 0;
    width: var(--size);
    height: var(--size);
    border-radius: 9999px;
  }
  [class^="segment_"]::after {
    position: absolute;
    inset: 0;
    opacity: .125;
  }`

  document.body.prepend(
    createElement(
      "style",
      { id: "color-segments" },
      [segmentCSSProperties, inlineSegmentStyles].join("\n"),
    ),
  )

  parsedSBData.forEach((cell) => {
    const { text, _ref } = cell.segment

    _ref.classList.add("segment-cell")

    _ref.innerHTML = ""
    // Lazy AF implementation
    const segTag = createElement("div", {})
    segTag.classList.add(`segment_${text}`)
    segTag.innerHTML = `<span id="label">${SB_SEGMENTS[text].text}</span>`

    _ref.append(segTag)
  })

  /***************************************************************
   *
   * Replace all the locked segments for skips, mutes, and full labels;
   * otherwise, display "All [X] segments are locked", if all segments
   * are locked
   *
   ***************************************************************/
  const renderPill = (text, { bg, fg }) => {}

  const parseSegment2Pills = () => {}

  const parseLockedSegments = (element) => {
    // row order: submissions,ignored,skips,mutes,full,ytlink
    if (element.tagName.toLowerCase() === "div") return

    const [, , lockedSkips, lockedMutes, lockedFulls, ,] = Array.from(
      element.children,
    )
    const lockedSegmentGroupArr = [lockedSkips, lockedMutes, lockedFulls]

    lockedSegmentGroupArr.forEach((lockedAction) => {
      const hasLockedSegments = !lockedAction.textContent.match(/—/)

      if (hasLockedSegments)
        console.log(
          lockedAction.textContent.split(":")[0],
          Array.from(lockedAction.children).map((segment) => ({
            segment: segment.textContent,
            reason: segment.title,
          })),
        )
    })
  }

  if (route.video)
    parseLockedSegments(elementSelect(".row.mt-2 > .col-auto > .list-group"))
  if (route.uuid) parseLockedSegments(elementSelect(".row.mb-4 .list-group"))

  /***************************************************************
   *
   * Append data from YT Data API
   *
   ***************************************************************/
  let fetchTargets = []

  // Init the cache from localStorage if there's none
  let cachedIds
  const CACHE_LS_KEY = "cachedIds"

  // * This is only temporary will rewrite an efficent ls func that will use `instanceof`
  // * Eh screw it I'm lazy anyway lol
  const localCache = {
    get: () => {
      const cachedIdsStorage = localStorage.getItem(CACHE_LS_KEY)

      if (!cachedIdsStorage) {
        localStorage.setItem(CACHE_LS_KEY, JSON.stringify([]))
        return []
      }

      return JSON.parse(/** @type {string} */ (cachedIdsStorage))
    },
    append: (...newData) => {
      const lsCached = JSON.parse(
        /** @type {string} */ (localStorage.getItem(CACHE_LS_KEY)),
      )
      const mergedData = lsCached?.concat(...newData)

      localStorage.setItem(CACHE_LS_KEY, JSON.stringify(mergedData))
    },
  }

  cachedIds = localCache.get()

  const hasVideoData = route.userid || route.username || route.main
  const hasPreciousData = parsedSBData[0].videoId !== null

  const updateCacheLenLabel = () => {
    debugLog(`There are ${cachedIds.length} ID(s) saved to localStorage`)

    const _globalNav = elementSelect(".container-fluid nav > .container-fluid")

    const cachedIndicator = createElement(
      "span",
      { style: "padding-right: 0.5rem;" },
      `Videos cached: ${cachedIds.length}`,
    )

    _globalNav.append(cachedIndicator)
  }

  updateCacheLenLabel()

  // TODO do the same logic for route.video and route.uuid
  if (hasVideoData && hasPreciousData) {
    parsedSBData.forEach(({ videoId }) => {
      const realVideoId = videoId?.text

      // Check if the id exists, if not add them
      if (!fetchTargets.some((target) => target.videoId === realVideoId))
        fetchTargets.push({
          domTargets: [],
          videoId: realVideoId,
        })
    })

    parsedSBData.forEach(({ videoId }) => {
      const { domTargets } = fetchTargets.find(
        (target) => target.videoId === videoId?.text,
      )

      domTargets.push(videoId?._ref)
    })

    // Check if the API key is provided
    const YT_API_KEY = localStorage.getItem("yt-api")
    if (!YT_API_KEY)
      throw new Error(
        'YT API key missing! Type `localStorage.setItem("yt-api", "<YOUR_API_KEY>")` to dismiss this error',
      )

    let _temp$UncachedIds = []

    const appendYTData = (el, channelId, channelTitle, videoId, videoTitle) => {
      const videoThumbnail = createElement("img", {
        src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        id: "video-thumbnail",
        style:
          "aspect-ratio: 16/9;height: 4.5rem;border-radius: 0.33rem;float: left;margin-right: 0.5rem;object-fit:cover;",
      })
      const channelName = createElement(
        "a",
        {
          href: `https://www.youtube.com/channel/${channelId}`,
          id: "channel-name",
          style: "margin: 0 1rem",
          target: "_blank",
        },
        channelTitle,
      )

      elementSelect("a", el).textContent = videoTitle

      el.prepend(videoThumbnail)
      el.append(channelName)
    }

    let [currentCacheIndex, currentFetchedIndex] = [0, 0]

    const pushToCache = () => {
      console.debug("Uncached IDs to be added to cache =>", _temp$UncachedIds)
      localCache.append(_temp$UncachedIds)
    }

    const fetchTargLen = fetchTargets.length

    fetchTargets.forEach(({ videoId: currentVideoId, domTargets }) => {
      const hasCacheItems = cachedIds.find(
        (cachedItem) => cachedItem.id === currentVideoId,
      )

      if (hasCacheItems) {
        const {
          id: cacheId,
          contents: {
            title: cacheTitle,
            channelId: cacheChannelId,
            channelName: cacheChannelName,
          },
        } = hasCacheItems

        currentCacheIndex++

        console.log("[debug] cache hit  👀 ", `${cacheId}:`, cacheTitle)

        domTargets.forEach((element) =>
          appendYTData(
            element,
            cacheChannelId,
            cacheChannelName,
            currentVideoId,
            `⚡ | ${cacheTitle}`,
          ),
        )
      }
    })

    // Check for any cached videos that needs to be deducted and not 0
    if (fetchTargLen - currentCacheIndex !== 0) {
      // TODO consolidate the uncached video ids into one request
      fetchTargets.forEach(async ({ videoId: currentVideoId, domTargets }) => {
        const _asyncDeductCachedIndex = fetchTargLen - currentCacheIndex

        debugLog(
          "[async foreach] _asyncDeductCachedIndex:",
          _asyncDeductCachedIndex,
        )

        const ytUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${currentVideoId}&key=${YT_API_KEY}`

        // Cache if there aren't any
        if (!cachedIds.find((cachedItem) => cachedItem.id === currentVideoId)) {
          const ytFetch = await fetch(ytUrl)
          const ytData = await ytFetch.json()

          const ytVideoItem = ytData.items[0]

          currentFetchedIndex++

          if (!ytVideoItem) {
            console.warn(
              `Video id ${currentVideoId} is either private or deleted`,
            )
            return
          }

          const { title, channelTitle, channelId } = ytVideoItem.snippet

          console.log("[debug] cache miss ❌ |", currentVideoId, "--", title)

          _temp$UncachedIds.push({
            id: currentVideoId,
            contents: {
              title: title,
              channelName: channelTitle,
              channelId: channelId,
            },
            date: CURRENT_DATE.toISOString(),
            at: location.href,
          })

          domTargets.forEach((element) =>
            appendYTData(
              element,
              channelId,
              channelTitle,
              currentVideoId,
              `✨ | ${title}`,
            ),
          )

          if (currentFetchedIndex == _asyncDeductCachedIndex) pushToCache()
        }
      })
    }
  }
})()
