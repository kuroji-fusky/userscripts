(function () {
  "use strict"

  const videoItems = document.querySelectorAll("ytd-browse ytd-rich-grid-media")
  const viWithMeta = Array.from(videoItems).map((d) => {
    const metaEl = d.querySelector("#meta")
    const metaText = metaEl.innerText.split("\n")

    if (metaEl.__dataHost && metaEl.__dataHost.__data) {
      const dataHostMeta = metaEl.__dataHost.__data.data

      return {
        // __target: d,
        title: dataHostMeta.title.runs[0].text,
        id: dataHostMeta.videoId,
        // viewStr: dataHostMeta.viewCountText.simpleText.split(" ")[0],
        views: parseInt(dataHostMeta.viewCountText.simpleText.split(" ")[0].replace(/,/g, "")),
      }
    }

    return metaText
  })

  const videosFiltered = viWithMeta
    .sort((a, b) => a.views - b.views)

  console.table(videosFiltered)
})()