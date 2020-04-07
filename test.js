import SimplePeer from "simple-peer";

/*
Visit index.html#1 from one browser (the initiator) and index.html from another browser (the receiver).

An "offer" will be generated by the initiator. Paste this into the receiver's form and hit submit. The receiver generates an "answer". Paste this into the initiator's form and hit submit.

Now you have a direct P2P connection between two browsers!
*/
function gotMedia(stream) {
  console.log("got media 2");
  const isInitiator = location.hash === "#1";
  const p = new SimplePeer({
    initiator: isInitiator,
    stream: isInitiator ? stream : undefined,

    trickle: false
  });

  p.on("stream", stream => {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector("video");

    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream); // for older browsers
    }

    console.log("gonna play");
    video.play();
  });
  p.on("error", err => console.log("error", err));

  p.on("signal", data => {
    console.log("SIGNAL", JSON.stringify(data));
    document.querySelector("#outgoing").textContent = JSON.stringify(data);
  });

  document.querySelector("form").addEventListener("submit", ev => {
    ev.preventDefault();
    p.signal(JSON.parse(document.querySelector("#incoming").value));
  });

  p.on("connect", () => {
    console.log("CONNECT");
    p.send("whatever" + Math.random());
  });

  p.on("data", data => {
    console.log("data: " + data);
  });
}

// get video/voice stream
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(gotMedia)
  .catch(() => {});