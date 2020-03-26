import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use Parcel to bundle this sandbox, you can find more info about Parcel
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

const leftVideo = document.getElementById("leftVideo");
const rightVideo = document.getElementById("rightVideo");

leftVideo.addEventListener("canplay", () => {
  let stream;
  const fps = 0;
  if (leftVideo.captureStream) {
    stream = leftVideo.captureStream(fps);
  } else if (leftVideo.mozCaptureStream) {
    stream = leftVideo.mozCaptureStream(fps);
  } else {
    console.error("Stream capture is not supported");
    stream = null;
  }
  rightVideo.srcObject = stream;
});
