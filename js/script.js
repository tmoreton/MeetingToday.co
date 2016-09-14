window.location.protocol = "https:"

var room = window.location.search.replace("?", "");
var link = "mailto:?Subject=Enter%20Room%20" + window.location.href

$("#link").attr("href", link);
$(".waiting-title").text(window.location.href);

var webrtc = new SimpleWebRTC({
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remoteVideos',
    autoRequestMedia: { audio: true, video: true },
    receiveMedia: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    }
});

webrtc.on('readyToCall', function () {
    webrtc.joinRoom(room, function(){
        webrtc.sendToAll('chat', {users: webrtc.webrtc.peers.length});
    });
    webrtc.pauseVideo();
    webrtc.mute();
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


$("#start-video-button").click(function(){
    $("#start-video-button").css("color", "#00b200");
    $("#start-audio-button").css("display", "none");
    webrtc.resumeVideo();
    webrtc.unmute();
})

$("#start-audio-button").click(function(){
    $("#start-audio-button").css("color", "#00b200");
    $("#start-video-button").css("display", "none");
    webrtc.unmute();
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
            $("#download").css("display", 'block')
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

var checkPeers = function(){
    if (webrtc.webrtc.peers.length < 1){
        $("#waiting").css("display", "block");
        $(".tutorial-nav").css("visibility", "visible");
    } else if(webrtc.webrtc.peers.length >= 1){
        $("#waiting").css("display", "none");
        $(".tutorial-nav").css("visibility", "hidden");
    }
}

window.setInterval(checkPeers, 500);