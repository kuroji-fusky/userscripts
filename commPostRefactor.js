;(() => {
  "use strict"
  if (!window.location.href.endsWith("/community")) {
    console.error("lmao")
    return
  }

  const convertAbbrNums = (abbrNum) => {
    if (isNaN(abbrNum)) return 0

    const abbrs = {
      K: 1_000,
      M: 1_000_000,
    }

    const multiplier = abbrs[abbrNum.slice(-1)] || 1
    const numPart = parseFloat(abbrNum)

    return numPart * multiplier
  }

  const backstagePosts = document.querySelectorAll(
    "ytd-backstage-post-thread-renderer",
  )

  const parsedPosts = Array.from(backstagePosts).map((post) => {
    // Check if the post is reposted from another channel
    const repostCtx = post.querySelector("#repost-context")
    const isReposted = !!repostCtx

    const findSelector = (selector, callback) => {
      const el = post.querySelector(selector)
      return callback(el)
    }

    const stripText = (str, strOmitter, pIndex = 0) =>
      str.split(strOmitter).at(pIndex).trim()

    // Main post contents
    const [ogPostAuthor, ogPostAuthorUrl] = findSelector(
      "#author-text",
      (e) => [e.textContent.trim(), e.href],
    )

    const [ogPostUrl, ogPostUrlId, ogPostDate, ogPostIsEdited] = findSelector(
      "#published-time-text a",
      (e) => {
        const postTextContent = e.textContent

        const postUrl = e.href
        const postUrlId = postUrl.split("/").at(-1)
        const postDate = stripText(postTextContent, "(edited)")
        const postIsEdited = postTextContent.includes("(edited)")

        return [postUrl, postUrlId, postDate, postIsEdited]
      },
    )

    const [ogPostBody, ogBodySelector] = findSelector("#content-text", (e) => [
      e.textContent,
      e,
    ])

    // Get all the mentions of the post body
    const ogPostMentionsSelector = ogBodySelector.querySelectorAll(
      'a[href*="/channel"]',
    )
    const ogPostMentions = Array.from(ogPostMentionsSelector).map(
      (channel) => ({
        handle: channel.textContent,
        url: channel.href,
      }),
    )

    // Likes and comment count
    const [likeCount, commentCount] = findSelector(
      "ytd-comment-action-buttons-renderer",
      (e) => {
        const likesSelector = e.querySelector("#vote-count-middle")
        const commentSelector = e.querySelector(
          '#reply-button-end [role="text"]',
        )

        const likes = likesSelector
          ? convertAbbrNums(likesSelector.textContent)
          : 0

        const comments = commentSelector
          ? convertAbbrNums(commentSelector.textContent)
          : 0

        return [likes, comments]
      },
    )

    // Repost contents
    const [repostAuthor, repostAuthorUrl] = findSelector(
      "#repost-author-text",
      (e) => [
        isReposted ? e.textContent.trim() : null,
        isReposted ? e.href : null,
      ],
    )

    const [repostDate, repostIsEdited, repostUrl] = findSelector(
      "#repost-published-time-text",
      (e) => {
        const text = isReposted ? e.textContent : ""

        const date = stripText(text, "shared", -1)
        const isEdited = text.includes("(edited)")
        const link = isReposted ? e.href : ""

        return [date, isEdited, link]
      },
    )

    const repostBodySelector = post.querySelector("#repost-content-text")
    const repostBody = repostBodySelector
      ? repostBodySelector.textContent
      : null

    // Swap post contents if it's a repost and vice-versa
    const originalPost = {
      id: ogPostUrlId,
      author: ogPostAuthor,
      authorUrl: ogPostAuthorUrl,
      date: ogPostDate,
      isEdited: ogPostIsEdited,
      body: ogPostBody,
      likeCount,
      commentCount,
      url: ogPostUrl,
      mentions: ogPostMentions,
    }

    const repostPost = {
      author: repostAuthor,
      authorUrl: repostAuthorUrl,
      date: repostDate,
      body: repostBody,
      isEdited: repostIsEdited,
      url: repostUrl,

      repostLikeCount: likeCount,
      repostCommentCount: commentCount,
      repostId: ogPostUrlId,
      repostAuthor: ogPostAuthor,
      repostAuthorUrl: ogPostAuthorUrl,
      repostDate: ogPostDate,
      repostIsEdited: ogPostIsEdited,
      repostBody: ogPostBody,
      repostUrl: ogPostUrl,
      repostMentions: ogPostMentions,
    }

    const parsedData = !isReposted ? originalPost : repostPost

    return parsedData
  })

  console.log(parsedPosts)
})()
