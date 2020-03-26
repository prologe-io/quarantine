import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use Parcel to bundle this sandbox, you can find more info about Parcel
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;
// https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/gum/js/main.js

const leftVideo = document.getElementById("leftVideo");
const rightVideo = document.getElementById("rightVideo");

const constraints = window.constraints = {
  audio: false,
  video: true
};


leftVideo.addEventListener("canplay", () => {
  const fps = 0;
  //rightVideo.srcObject = stream;
});
// https://github.com/babel/babel/issues/9849
async function getVideoStream() {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const video = document.querySelector('#camera');
  console.log(stream)
  const videoTracks = stream.getVideoTracks();
//  console.log('Got stream with constraints:', constraints);
//  console.log(`Using video device: ${videoTracks[0].label}`);
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

getVideoStream()