var host = "meetingtoday.co"
if (window.location.host == host && window.location.protocol != "https:") {
  window.location.protocol = "https:"
}

var webrtc;
var room = window.location.search.replace("?", "");
var link = "mailto:?Subject=Enter%20Room%20" + window.location.href

$("#link").attr("href", link);
$(".waiting-title").text(window.location.href);


function startRoom(audio, video){
    webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideosEl: 'remoteVideos',
        autoRequestMedia: { audio: audio, video: video },
        receiveMedia: {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }
    });

    webrtc.on('readyToCall', function () {
        webrtc.joinRoom(room, function(){
            webrtc.sendToAll('chat', {users: webrtc.webrtc.peers.length});
        });
    });

    webrtc.on('createdPeer', function (peer) {
        var peer = peer;
        getPeer(peer);
    });

    webrtc.connection.on('message', function(data){
        if(data.type === 'chat'){
            $( "#notes" ).val(data.payload.message)
        }
    });

    $( "#notes" ).keyup(function() {
      var notes = $( "#notes" ).val()
      webrtc.sendToAll('chat', {message: notes, users: webrtc.webrtc.peers.length});
    });
    $("#start-file-button").css("display", "block")
}

$("#start-video-button").click(function(){
    $("#start-video-button").css("display", "none");
    $("#start-audio-button").css("display", "none");
    $("#end-call-button").css("display", "block");
    $("#waiting").css("display", "none");
    startRoom(true, true);
})

$("#start-audio-button").click(function(){
    $("#start-audio-button").css("display", "none");
    $("#start-video-button").css("display", "none");
    $("#end-call-button").css("display", "block");
    $("#waiting").css("display", "none");
    startRoom(true, false);
})

// $("#start-file-button").click(function(){
//     $("#waiting").css("display", "none");
//     startRoom(false, false);
// })

$("#end-call-button").click(function(){
    $("#start-audio-button").css("display", "block");
    $("#start-video-button").css("display", "block");
    $("#end-call-button").css("display", "none");
    $("#waiting").css("display", "block");
    webrtc.disconnect();
    webrtc.stopLocalVideo();
})

$(".fa-file").click(function(){
    $(".modal").addClass("is-active")
})
$(".modal-close, .modal-background").click(function(){
    $(".modal").removeClass("is-active")
})

function getPeer(peer){
    // receiving an incoming filetransfer
    peer.on('fileTransfer', function (metadata, receiver) {
        console.log('incoming filetransfer', metadata.name, metadata);
        $("#progress").attr("max", metadata.size)
        receiver.on('progress', function (bytesReceived) {
            $("#progress").attr("value", bytesReceived)
            console.log('receive progress', bytesReceived, 'out of', metadata.size);
        });
        // get notified when file is done
        receiver.on('receivedFile', function (file, metadata) {
            console.log('received file', metadata.name, metadata.size);

            var url = URL.createObjectURL(file)
            $("#download-btn").css("display", 'block')
            $("#download").attr("href", url)
            $("#download").attr("download", metadata.name)
            // close the channel
            receiver.channel.close();
        });
        filelist.appendChild(item);
    });

    var fileinput = document.getElementById('file');
    fileinput.type = 'file';

    fileinput.addEventListener('change', function() {
        // fileinput.disabled = true;
        var file = fileinput.files[0];
        var sender = peer.sendFile(file);
        $(".modal").removeClass("is-active")
    });
}

// var checkPeers = function(){
//     if (webrtc.webrtc.peers.length < 1){
//         $("#waiting").css("display", "block");
//     } else if(webrtc.webrtc.peers.length >= 1){
//         $("#waiting").css("display", "none");
//     }
// }

// window.setInterval(checkPeers, 500);