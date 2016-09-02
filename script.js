$("#start-video-button").click(function(){
    var webrtc = new SimpleWebRTC({
        localVideoEl: 'localVideo',
        remoteVideosEl: 'remoteVideos',
        media: {
            audio: true,
            video: true
        },
        autoRequestMedia: true,
        receiveMedia: {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 0
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

$("#start-audio-button").click(function(){
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

    var room = getParams('name')
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

    var room = getParams('name')
    webrtc.joinRoom(room);
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
        $("#progress").attr("max", metadata.size)
        receiver.on('progress', function (bytesReceived) {
            $("#progress").attr("value", bytesReceived)
            console.log('receive progress', bytesReceived, 'out of', metadata.size);
        });
        // get notified when file is done
        receiver.on('receivedFile', function (file, metadata) {
            console.log('received file', metadata.name, metadata.size);

            var url = URL.createObjectURL(file)
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