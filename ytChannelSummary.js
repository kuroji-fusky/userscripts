/**
 * @name KuroChannelSummarizer
 * @description This script injects an additional button from a channel page
 *
 * @version 1.0.0
 * @author Kuroji Fusky
 * @license MIT
 */
;(function () {
  // ytInitialData stuff
  const debugLog = (msg) => {
    return console.log(
      `%c[Kuro Extract YT Channel Data - Debug]%c ${msg}`,
      "color: #30a7d4; font-weight: 800",
      "color: currentColor"
    )
  }

  window.addEventListener("yt-navigate-finish", ({ detail: { response } }) => {
    const isChannelPage = response.page === "channel"

    if (!isChannelPage) {
      debugLog("Channel page not found, unmounting DOM")
      return
    }

    // Get channel metadata
    const pageRes = response.response

    const {
      header: { c4TabbedHeaderRenderer: __header },
      metadata: { channelMetadataRenderer: __metadata },
    } = pageRes

    const channelName = __header.title

    debugLog(`DOM mounted for channel "${channelName}"`)

    const hasChannelbanner = !!__header.banner

    if (!hasChannelbanner) debugLog(`No banner detected for ${channelName}`)

    const channelData = {
      banner: hasChannelbanner ? __header.banner.thumbnails.at(-1).url : "none",
      fullbanner: hasChannelbanner
        ? __header.tvBanner.thumbnails.at(-1).url
        : "none",
      avatarImg: __metadata.avatar.thumbnails[0].url,
      channelId: __metadata.channelUrl,
      channelName: __header.title,
      handle: __metadata.vanityChannelUrl.split("/").at(-1),
      description: __metadata.description,
      videos: __header.videosCountText.runs[0].text,
      subs: __header.subscriberCountText.simpleText,
    }

    console.table(channelData)
  })
})()
