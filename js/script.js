var room = getParams('name')
$("#room-name").text("Room " + room.toUpperCase())
$("#room-url").text(window.location.href)
$("#modal").click(function(){

})

var webrtc = new SimpleWebRTC({
    localVideoEl: '',
    remoteVideosEl: '',
    autoRequestMedia: false,
    receiveMedia: {
        offerToReceiveAudio: 0,
        offerToReceiveVideo: 0
    }
});

webrtc.joinRoom(room, function(test){
    webrtc.sendToAll('chat', {message: 'hello bitches', users: webrtc.webrtc.peers.length});
});

webrtc.connection.on('message', function(data){
    if(data.type === 'chat'){
        $( "#notes" ).val(data.payload.message)
    }
});

var checkPeers = function(){
    if (webrtc.webrtc.peers.length < 1){
        $("#waiting").css("display", "block");
    } else if(webrtc.webrtc.peers.length >= 1){
        $("#waiting").css("display", "none");
    }
}

window.setInterval(checkPeers, 500);

$( "#notes" ).keyup(function() {
  var notes = $( "#notes" ).val()
  webrtc.sendToAll('chat', {message: notes, users: webrtc.webrtc.peers.length});
});

// webrtc.on('createdPeer', function (peer) {
//     console.log("someone joined!!", peer.parent.peers.length)
//     if (peer.parent.peers.length > 0){
//         $("#waiting").css("display", "none")
//     }
// });

// webrtc.on('leftRoom', function (roomName) {
//     console.log("someone left...", roomName)
// });

$("#start-video-button").click(function(){
    $("#start-video-button").css("color", "#00b200");
    $("#start-audio-button").css("display", "none");
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
        webrtc.joinRoom(room);
    });

    webrtc.on('createdPeer', function (peer) {
        var peer = peer;
        getPeer(peer);
    });
})

$("#start-audio-button").click(function(){
    $("#start-audio-button").css("color", "#00b200");
    $("#start-video-button").css("display", "none");
    var webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideosEl: 'remoteVideos',
        media: {
            audio: true,
            video: false
        },
        autoRequestMedia: true,
        receiveMedia: {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 0
        }
    });

    webrtc.on('readyToCall', function () {
        webrtc.joinRoom(room);
    });
})

$("#start-file-button").click(function(){
    var webrtc = new SimpleWebRTC({
        localVideoEl: '',
        remoteVideosEl: '',
        autoRequestMedia: false,
        receiveMedia: {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 0
        }
    });

    webrtc.joinRoom(room);
    webrtc.on('createdPeer', function (peer) {
        var peer = peer;
        getPeer(peer);
    });
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
        fileinput.disabled = true;

        var file = fileinput.files[0];
        var sender = peer.sendFile(file);
    });
}

function getParams(name, url) {
    if (!url) {
     url = window.location.href;
    }
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) { 
        return undefined;
    }
    return results[1] || undefined;
}