/* 

youtube stuff

*/

var tag = document.createElement("script");
tag.id = "iframe-demo";
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

var playerStatus = -1;

window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId: currentSong.id,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.seekTo(getSeekTime());
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  //
}

/* 

sample queue in json

*/

const getCurrentTime = () => {
  const now = new Date();
  const secondsSinceEpoch = Math.round(now.getTime() / 1000);
  console.log(secondsSinceEpoch);
  return secondsSinceEpoch;
};

// this would look like what informaiton we store on the server
const currentSong = {
  id: "sZDKP5pnhhM",
  // update it with arbitrary start time
  startTime: 1586174170
};

const getSeekTime = () => {
  const seekTime = getCurrentTime() - currentSong.startTime;
  console.log(seekTime);
  return seekTime;
};

