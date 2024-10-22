var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {

                var theObject = JSON.parse(eventbody.body);
                var x = theObject.x;
                var y = theObject.y;

                var point = new Point(x, y);
                addPointToCanvas(point);

            });
        });

    };
    
    

    return {

        init: function () {
            //var can = document.getElementById("canvas");
            
            //websocket connection
            connectAndSubscribe();

            var can = document.getElementById("canvas");
            var offset;
            if(window.PointerEvent) {
                can.addEventListener("pointerdown", function(event){
                    offset  = getMousePosition(event);
                    app.publishPoint(offset.x,offset.y);
                });
            } else {
                canvas.addEventListener("mousedown", function(event){
                    offset  = getMousePosition(event);
                    app.publishPoint(offset.x,offset.y);
                    
                });
        
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            //publicar el evento

             stompClient.send("/topic/newpoint", {}, JSON.stringify({x:px,y:py}));

             //enviando un objeto creado a partir de una clase
             stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();