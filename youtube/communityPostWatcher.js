// ==UserScript==
// @name         YTCommunityPost++
// @version      2026-04-12
// @description  Extends additional utilities to community posts on YouTube
// @author       Kuroji Fusky
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==
"use strict"

// --------------------------------------
// HELPERS
// 
const _debug = (...msg) => console.debug("[kuro/communitypost++]", ...msg)

const isPostURL = () => /\/community\/|\/post(\/|s$)/.test(location.href)
const extractRunsText = (e) => e.runs.map((r) => r.text).join(" ")
const extractImageUrl = (backstageImages) => {
  const optimizedImg = backstageImages.image.thumbnails.map((iim) => iim.url)[0]
  return optimizedImg.replace(/=s\d+.*/, "=s0")
}

const parsePollAttachment = (pollData) => {
  const _choices = pollData.choices
  let totalVotes = 0
  const firstChoiceItem = _choices[0]

  if (firstChoiceItem.numVotes) {
    totalVotes = Math.round(firstChoiceItem.numVotes / firstChoiceItem.voteRatio);
  } else if (firstChoiceItem.voteRatioIfSelected !== undefined) {
    const d = firstChoiceItem.voteRatioIfSelected - firstChoiceItem.voteRatioIfNotSelected;
    // safety check to avoid dividing by zero 
    totalVotes = d > 0 ? Math.round(1 / d) : 0;
  } else {
    console.warn("Ratios are hidden because you not logged in");
    return {
      status: "unauthed",
      text: _choices.map(c => extractRunsText(c.text))
    };
  }

  const pollResults = _choices.map((c) => {
    const currentRatio = c.voteRatio !== undefined ? c.voteRatio : c.voteRatioIfNotSelected

    const pollImg = c.image ? extractImageUrl(c) : null

    return {
      text: extractRunsText(c.text),
      votes: Math.round(totalVotes * currentRatio),
      ratio: currentRatio,
      image: pollImg,
    }
  })

  return {
    totalVotes,
    results: pollResults
  }
}

const mapPostAttachments = (attachmentData) => {
  const hasAttachment = attachmentData !== undefined

  const attachmentKey = hasAttachment ? Object.keys(attachmentData)[0] : ""
  if (!hasAttachment) return null

  let attachmentRenderer;

  switch (attachmentKey) {
    case "pollRenderer":
      attachmentRenderer = parsePollAttachment(attachmentData.pollRenderer)
      break
    case "backstageImageRenderer":
      attachmentRenderer = extractImageUrl(attachmentData.backstageImageRenderer)
      break
    case "postMultiImageRenderer":
      attachmentRenderer = attachmentData.postMultiImageRenderer.images.map((image) => {
        return extractImageUrl(image.backstageImageRenderer)
      })
      break
    case "videoRenderer":
      attachmentRenderer = "VIDEO"
      break
    default:
      console.error(`Unknown key: ${attachmentKey}`)
  }

  return {
    _type: attachmentKey,
    contents: attachmentRenderer
  }
}

const getPosts = () => {
  const backstagePostsEl = Array.from(document.querySelectorAll("ytd-backstage-post-thread-renderer"))

  const posts = backstagePostsEl.map((post) => {
    // do checks if a post is shared or not because not all posts are the same
    const { backstagePostRenderer, sharedPostRenderer } = post.data?.post
    const backstageData = backstagePostRenderer ? backstagePostRenderer : sharedPostRenderer;
    const isPostShared = !backstagePostRenderer

    const postAttachments = mapPostAttachments(backstageData.backstageAttachment)

    return {
      id: backstageData.postId,
      isPostShared,
      attachment: postAttachments,
      postUrl: `https://www.youtube.com/post/${backstageData.postId}`,
      relativePublishDate: extractRunsText(backstageData.publishedTimeText),
      contentText: Object.entries(backstageData.contentText).length !== 0 ? extractRunsText(backstageData.contentText) : null,

      [Symbol.for("dynamicPostRenderer")]: backstageData,
    }
  })

  // Just an edge case everytime "yt-navigate-finish" fires
  if (posts.length === 0) return null
  _debug({ posts })

  return posts
}

window.addEventListener("yt-navigate-finish", ({ detail }) => {
  const _pageContext = detail.response.page

  if (!(_pageContext === "channel" || (isPostURL() && _pageContext === "browse"))) {
    _debug("Returning data for channel related pages only")
    return
  }

  getPosts()
})

window.addEventListener("yt-action", ({ detail }) => {
  const _actionType = detail.actionName

  // filtering unneeded noise
  if (
    _actionType === "yt-forward-redux-action-to-live-chat-iframe" ||
    _actionType === "yt-user-activity" ||
    _actionType === "yt-store-grafted-ve-action"
  ) return

  if (isPostURL() && _actionType === "yt-window-scrolled") {
    getPosts()
  }
})