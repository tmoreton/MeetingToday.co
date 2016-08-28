$("#start-video-button").click(function(){
    var webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideosEl: 'remoteVideos',
        autoRequestMedia: { audio: true, video: true },
        receiveMedia: {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }
    });

    var room = getParams('name')
    webrtc.on('readyToCall', function () {
        webrtc.joinRoom(room);
    });

    // called when a peer is created
    webrtc.on('createdPeer', function (peer) {
        var peer = peer;
        console.log('createdPeer', peer);
        getPeer(peer);
    });
})

function getPeer(peer){
    // receiving an incoming filetransfer
    peer.on('fileTransfer', function (metadata, receiver) {
        console.log('incoming filetransfer', metadata.name, metadata);
        receiver.on('progress', function (bytesReceived) {
            console.log('receive progress', bytesReceived, 'out of', metadata.size);
        });
        // get notified when file is done
        receiver.on('receivedFile', function (file, metadata) {
            console.log('received file', metadata.name, metadata.size);

            // close the channel
            receiver.channel.close();
        });
        filelist.appendChild(item);
    });

    // select a file
    var fileinput = document.createElement('input');
    fileinput.type = 'file';

    // send a file
    fileinput.addEventListener('change', function() {
        fileinput.disabled = true;

        var file = fileinput.files[0];
        var sender = peer.sendFile(file);
    });
}


// $("#start-audio-button").click(function(){
//     var webrtc = new SimpleWebRTC({
//         localVideoEl: 'localVideo',
//         remoteVideosEl: 'remoteVideos',
//         autoRequestMedia: { audio: true, video: false },
//         receiveMedia: {
//             offerToReceiveAudio: 0,
//             offerToReceiveVideo: 0
//         }
//     });

//     var room = getParams('name')
//     webrtc.on('readyToCall', function () {
//         webrtc.joinRoom(room);
//     });
// })

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