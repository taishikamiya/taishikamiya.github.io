$(function() {
        var sendFacePP = function(canvas, func, errFunc) {
                //ここから画像のバイナリ化
                var can = canvas.toDataURL();
                // Data URLからBase64のデータ部分のみを取得
                var base64Data = can.split(',')[1];
                // base64形式の文字列をデコード
                var data = window.atob(base64Data); 
                var buff = new ArrayBuffer(data.length);
                var arr = new Uint8Array(buff);
                // blobの生成
                for(var i = 0, dataLen = data.length; i < dataLen; i++){
                        arr[i] = data.charCodeAt(i);
                }
                var blob = new Blob([arr], {type: 'image/png'});
                //ここから画像データ送信
                //urlを設定
                var api_key = 'AIzaSyAfPWqy-x0EpEuz3cdkzQYqRqcy51c2-ww';
                var url = 'https://vision.googleapis.com/v1/images:annotate' + '?key=' + api_key;
                //データをセット
                var formData = new FormData();
                formData.append('img', blob);
                //非同期通信開始
                $.ajax({
                        url: url,
                        type: 'POST',
                        contentType:'application/json',
                        data: JSON.stringify({requests: [{image: {content: base64Data}, features: {type: "FACE_DETECTION", maxResults: 3}}]}), 
                        dataType: 'json',
                        success: func,
                        error: errFunc
                 });
        };
        var renderStart = function() {
                if (localMediaStream) {
                        var canvas = document.getElementById('canvas');
                        //canvasの描画モードを2sに
                        var ctx = canvas.getContext('2d');                                                                                                                                        
                        var img = document.getElementById('img');
                        var sending = false
                        var faceData = { "responses" : [] };
                        var render = function() {
                                requestAnimationFrame(render);
                                //videoの縦幅横幅を取得
                                var w = video.offsetWidth;
                                var h = video.offsetHeight;
                                //同じサイズをcanvasに指定
                                canvas.setAttribute("width", w);
                                canvas.setAttribute("height", h);
                                //canvasにコピー
                                ctx.drawImage(video, 0, 0, w, h);
                                        
                                var i;
                                var j;
                                for (i = 0; i < faceData['responses'].length; i++) {
                                        var faces = faceData['responses'][i]['faceAnnotations'];
                                        if (!faces) {
                                                break;
                                        }
                                        for (j = 0; j < faces.length; j++) {
                                          var facePos = faces[j]["boundingPoly"]["vertices"];
                                          //console.log(facePos);
                                          var serial = function(num) {
                                                return isNaN(num) ? 0 : num;
                                          };
                                          var width = serial(facePos[1]["x"]) - serial(facePos[0]["x"]);
                                          var height = serial(facePos[2]["y"]) - serial(facePos[1]["y"]);
                                          var posX = serial(facePos[0]["x"]);
                                          var posY = serial(facePos[0]["y"]);
                                          ctx.strokeStyle = "rgb(200, 0, 0)";
                                          ctx.lineWidth = 10;
                                          ctx.strokeRect(posX, posY, width, height);
                                        }
                                }
                                if (!sending) {
                                        sending = true;
                                        sendFacePP(canvas, function(data, dataType) {
                                                        console.log(data);
                                                        faceData = data;
                                                        sending = false;
                                                },
                                                function(XMLHttpRequest, textStatus, errorThrown) {
                                                        console.log('Error : ' + errorThrown);
                                                        sending = false;
                                                }
                                        );
                                }
                        };
                        render();
                }
        };
        //videoタグを取得
        var video = document.getElementById('video');
        //カメラが起動できたかのフラグ
        var localMediaStream = null;
        //カメラ使えるかチェック
        var hasGetUserMedia = function() {
                return (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        };
        //エラー
        var onFailSoHard = function(e) {
                console.log('エラー!', e);
        };
        if(!hasGetUserMedia()) {
                alert("未対応ブラウザです。");
        } else {
//                window.URL = window.URL || window.webkitURL;
//                navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//                navigator.getUserMedia({audio: false, video: true}, function(stream) {
//                        video.src = window.URL.createObjectURL(stream);
//                        localMediaStream = stream;
//                        renderStart();
//                }, onFailSoHard);
                const medias = {audio : false, video : true},
                video  = document.getElementById("video");

                navigator.getUserMedia(medias, successCallback, errorCallback);

        }

function successCallback(stream) {
  video.srcObject = stream;
};

function errorCallback(err) {
  alert(err);
};

});

