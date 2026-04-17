// ==UserScript==
// @name         YTCommunityPost++
// @version      2026-04-17
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

const ATTACHMENT = {
  img: "backstageImageRenderer",
  multiImg: "postMultiImageRenderer",
  video: "videoRenderer",
  playlist: "playlistRenderer",
  poll: "pollRenderer"
}

const parsePollAttachment = (pollData) => {
  let totalVotes = 0

  const _choices = pollData.choices
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
  let attachmentRenderer = null

  switch (attachmentKey) {
    case ATTACHMENT["poll"]:
      attachmentRenderer = parsePollAttachment(attachmentData.pollRenderer)
      break
    case ATTACHMENT["img"]:
      attachmentRenderer = extractImageUrl(attachmentData.backstageImageRenderer)
      break
    case ATTACHMENT["multiImg"]:
      attachmentRenderer = attachmentData.postMultiImageRenderer.images.map((image) => {
        return extractImageUrl(image.backstageImageRenderer)
      })
      break
    case ATTACHMENT["video"]:
      attachmentRenderer = "VIDEO"
      break
    case ATTACHMENT["playlist"]:
      attachmentRenderer = "THERE'S PLAYLISTS"
      break
    default:
      console.error(`Unknown key: ${attachmentKey}`)
  }

  return {
    _type: attachmentKey,
    contents: attachmentRenderer
  }
}

// --------------------------------------
// UI
// 
class KuroComponent {
  constructor(component_id, tag, attrs) {
    this.__host_node = KuroComponent.createElement(tag, {
      ...Object.fromEntries([[`data-${component_id}`, ""]]),
      ...attrs
    })

    Object.assign(this.__host_node, {
      [Symbol.for("__kuroComponent")]: component_id
    })

    this._shadowNode = this.__host_node.attachShadow({ mode: "open" })
  }

  static createElement(tag, attrs) {
    const el = document.createElement(tag ?? "div")

    if (!attrs) return el

    for (const [attr_key, attr_val] of Object.entries(attrs)) {
      el.setAttribute(attr_key, attr_val)
    }

    return el
  }

  style(styleStr) {
    const orphanStyleSheet = new CSSStyleSheet()
    orphanStyleSheet.replaceSync(styleStr)

    this._shadowNode.adoptedStyleSheets = [orphanStyleSheet]
  }

  appendChildren(...children) {
    this._shadowNode.append(...children)

    return this.__host_node
  }
}

const renderToolbar = (postType) => {
  const toolContainer = new KuroComponent("kuro-backstage-lowerthird")
  toolContainer.style(`:host { 
    display: block; 

    font-family: Roboto, Arial, sans-serif;
    color: white;
    font-size: 1.33rem;
  }
  
  #wrapper {
    margin-top: 0.8rem;
    padding-block: 0.75rem;
    padding-inline: 0.85rem;
    background-color: green;
    border-radius: 6px;
  }`)

  const ctWrapper = KuroComponent.createElement("div", {
    id: "wrapper"
  })
  ctWrapper.append("Toolbar placeholder")

  return toolContainer.appendChildren(ctWrapper)
}

// --------------------------------------
// ENTRY
// 
window.__kuroTrackedPosts = window.__kuroTrackedPosts || new Set()
const traccedPosts = window.__kuroTrackedPosts

const getPosts = () => {
  const backstagePostsEl = Array.from(document.querySelectorAll("ytd-backstage-post-thread-renderer"))

  const posts = backstagePostsEl.map((post) => {
    // do checks if a post is shared or not because not all posts are the same
    const { backstagePostRenderer, sharedPostRenderer } = post.data?.post
    const backstageData = backstagePostRenderer ? backstagePostRenderer : sharedPostRenderer;
    const isPostShared = !backstagePostRenderer

    const postAttachments = mapPostAttachments(backstageData.backstageAttachment)
    const postId = backstageData.postId

    
    // skip rendering with those that has no attachments
    const hasAttachments = postAttachments && (
      postAttachments._type === "backstageImageRenderer"
      || postAttachments._type === "postMultiImageRenderer"
      || postAttachments._type === "pollRenderer"
    )
    
    const commentContainer = post.querySelector("ytd-comment-action-buttons-renderer")
    if (!traccedPosts.has(postId) && hasAttachments) {
      traccedPosts.add(postId)
      commentContainer.parentNode.insertBefore(renderToolbar(postAttachments._type), commentContainer)
    }

    // for debugging only; remove if everything's implemented
    return {
      id: postId,
      isPostShared,
      attachment: postAttachments,
      // postUrl: `https://www.youtube.com/post/${backstageData.postId}`,
      relativePublishDate: extractRunsText(backstageData.publishedTimeText),
      contentText: Object.entries(backstageData.contentText).length !== 0 ? extractRunsText(backstageData.contentText) : null,

      [Symbol.for("dynamicPostRenderer")]: backstageData,
    }
  })

  // Just an edge case everytime "yt-navigate-finish" fires
  if (posts.length === 0) return null

  _debug({ trackedPosts: traccedPosts })

  return posts
}

window.addEventListener("yt-navigate-finish", ({ detail }) => {
  const _pageContext = detail.response.page

  if (!(_pageContext === "channel" || (isPostURL() && _pageContext === "browse"))) {
    // perform a clean if user has navigated elsewhere
    if (traccedPosts.size === 0) {
      traccedPosts.clear()
    }

    _debug("Returning data for channel related pages only")
    return
  }

  getPosts()
})

window.addEventListener("yt-action", ({ detail }) => {
  const _actionType = detail.actionName

  // filtering unneeded noise
  if (
    _actionType === "yt-forward-redux-action-to-live-chat-iframe"
    || _actionType === "yt-user-activity"
    || _actionType === "yt-store-grafted-ve-action"
  ) return

  if (isPostURL() && _actionType === "yt-window-scrolled") {
    getPosts()
  }
})