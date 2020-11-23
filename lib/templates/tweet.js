var _ = require('lodash');

function buildTweet(tweet) {
  return `
  <p class="tweet-wrapper">
    ${buildHeader(tweet)}
    ${buildReply(tweet)}
    ${buildBody(tweet)}
    ${buildFooter(tweet)}
  </p>
  `;
}

function buildHeader(tweet) {
  return `
<div class="tweet-header">
  ${buildUserIcon(tweet)}
  ${buildUserPseudonym(tweet)}
  ${buildUserName(tweet)}
</div>
  `;
}

function buildUserIcon(tweet) {
  return `
<span class="tweet-user-icon">
  <a href="https://twitter.com/${tweet.user.screen_name}">
    <img src="${tweet.user.profile_image_url_https}"></img>
  </a>
</span>`;
}

function buildUserPseudonym(tweet) {
  return `
<span class="tweet-user-pseudonym">
  <a href="https://twitter.com/${tweet.user.screen_name}">${tweet.user.name}</a>
</span>`;
}

function buildUserName(tweet) {
  return `<span class="tweet-user-name">${tweet.user.screen_name}</span>`;
}

function buildReply(tweet) {
  if (tweet.in_reply_to_screen_name) {
    return `
<div class="tweet-reply-context">
  Replying to <a href="https://twitter.com/${tweet.in_reply_to_screen_name}">@${tweet.in_reply_to_screen_name}</a>
</div>
    `
  }
  return '';
}

function buildBody(tweet) {
  return `
  <div class="tweet-body">
    ${buildText(tweet)}
    ${buildMedia(tweet)}
  </div>
  `;
}

function buildText(tweet) {
  return `<div class="tweet-text" style="font-size:1.5em;">${tweet.full_text}</div>`;
}

function buildMedia(tweet) {
  var mediaItems = [];
  if (tweet.extended_entities) {
    if (tweet.extended_entities.media) {
      _.each(tweet.extended_entities.media, (item, index) => {
        mediaItems.push(item);
      });
    }
  }
  var mediaBlock = '';
  if (mediaItems.length > 0) {
    for(var mediaItem of mediaItems) {
      switch(mediaItem.type) {
        case 'photo':
          mediaBlock += buildMediaPicture(mediaItem);
          break;
        case 'video':
          mediaBlock += buildMediaVideo(mediaItem);
          break;
        default:
          console.warn(`[T-${tweet.id_str}] Received unsupported media type [${mediaItem.type}]`);
      }
    }
  }
  return mediaBlock;
}

function buildMediaPicture(mediaItem) {
  return `
    <div class="tweet-media tweet-photo"><a href="${mediaItem.media_url_https}"><img src="${mediaItem.media_url_https}"></img></a></div>`;
}

function buildMediaVideo(mediaItem) {
  if (!mediaItem || !mediaItem.video_info || !mediaItem.video_info.variants) {
    console.warn(`[T-${mediaItem.id_str}] Missing required content to embed a video`);
    return '';
  }

  var sources = '';
  for(var variant of mediaItem.video_info.variants) {
    sources += `
        <source src="${variant.url}" type="${variant.content_type}">`;
  }

  return `
    <div class="tweet-media tweet-video">
      <video controls="controls">${sources}

        Your browser does not support the HTML5 Video element.
      </video>
    </div>`;
}

function buildFooter(tweet) {
  return `
<div class="tweet-footer">
  <a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.created_at}</a>${createAppSourceLink()}
</div>
  `;
}

function createAppSourceLink() {
  return ` · <a href="https://twitter2rssapi.herokuapp.com/">Twitter2RSS</a>`
}

module.exports = {
  buildTweet: buildTweet,
};
