;(function () {
  "use strict"
  const windowUrl = window.location.href
  if (!windowUrl.endsWith("/community")) {
    console.log("yeet")
    return
  }

  const backstageContainer = document.querySelectorAll(
    "ytd-backstage-post-thread-renderer",
  )

  Array.from(backstageContainer).forEach((post) => {
    const customSelector = (element, cb) => (element ? cb(element) : null)

    const $ps = (e) => post.querySelector(e)

    const postBody = $ps("yt-formatted-string#content-text")
    const postAuthor = $ps("#author-text").textContent.trim()
    const postLink = $ps("#published-time-text a").href
    const postAuthorLink = $ps("#author-text").href

    const trimEditedText = (str) => str.split("(edited)").at(0).trim()

    const postDate = $ps("#published-time-text a")
      .textContent.split("(edited)")
      .at(0)
      .trim()
    const postHasEdited = $ps("#published-time-text a").textContent.includes(
      "(edited)",
    )

    // check if a post is a repost from another channel
    // const isRepost = $ps("#repost-context")

    // const repostAuthor = isRepost
    //   ? isRepost.querySelector("#repost-author-text").textContent.trim()
    //   : null
    // const repostAuthorLink = isRepost
    //   ? isRepost.querySelector("#repost-author-text").href
    //   : null

    // const repostBody = isRepost
    //   ? isRepost.querySelector("#repost-content-text").textContent
    //   : null
    // const repostDate = isRepost
    //   ? isRepost
    //       .querySelector("#repost-published-time-text")
    //       .textContent.split("shared")
    //       .at(-1)
    //       .trim()
    //   : null

    // const repostHasEdited = isRepost
    //   ? isRepost
    //       .querySelector("#repost-published-time-text")
    //       .textContent.includes("(edited)")
    //   : null
    // const repostLink = isRepost
    //   ? isRepost.querySelector("#repost-published-time-text a").href
    //   : null

    // get any channel mentions on a post
    // const postMentionsSelector = postBody.querySelectorAll(
    //   'a[href*="/channel"]',
    // )
    // const postMentions = Array.from(postMentionsSelector).map((channel) => ({
    //   handle: channel.textContent,
    //   link: channel.href,
    // }))

    // likes and comment counts
    const postActions = $ps("ytd-comment-action-buttons-renderer")
    const postLikes = postActions.querySelector("#vote-count-middle")
    const postCommentCount = postActions.querySelector(
      `#reply-button-end [role="text"]`,
    )

    const contentAttachmentSelector = $ps("#content-attachment:not([hidden])")

    const attachments = {
      multiImg: contentAttachmentSelector
        ? contentAttachmentSelector.querySelector(
            "ytd-post-multi-image-renderer",
          )
        : null,
      img: contentAttachmentSelector
        ? contentAttachmentSelector.querySelector(
            "ytd-backstage-image-renderer",
          )
        : null,
      video: contentAttachmentSelector
        ? contentAttachmentSelector.querySelector("ytd-video-renderer")
        : null,
    }

    const content = {
      // isRepost: !!isRepost,
      // postAuthor: isRepost ? repostAuthor : postAuthor,
      // postAuthorLink: isRepost ? repostAuthorLink : postAuthorLink,
      // postLink,
      // postDate,
      // postHasEdited: isRepost ? repostHasEdited : postHasEdited,
      //postBody: isRepost ? repostBody : postBody.textContent,
      //postLikes: isRepost ? null : parseInt(handleNullContent(postLikes)),
      //postMentions: isRepost ? null : postMentions,
      //postCommentCount: isRepost ? null : parseInt(handleNullContent(postCommentCount)),
      //repostAuthor: isRepost ? postAuthor : null,
      //repostAuthorLink: isRepost ? postAuthorLink : null,
      //repostBody: isRepost ? postBody.textContent : repostBody,
      //repostLink,
      //repostDate,
      //repostHasEdited: isRepost ? postHasEdited : repostHasEdited,
      //repostMentions: isRepost ? postMentions : null,
      //repostLikes: isRepost ? parseInt(handleNullContent(postLikes)) : null,
      //repostCommentCount: isRepost ? parseInt(handleNullContent(postCommentCount)) : null,
      //target: post,
    }

    console.log(content)
  })
})()
