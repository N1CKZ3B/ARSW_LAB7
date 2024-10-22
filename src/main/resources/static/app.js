var app = (function () {

    var topico = 0;

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToTopic = function(point){
        stompClient.send("/app"+topico, {}, JSON.stringify(point));
        //console.log("funciona"+point);
    };

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

    var addPolygonToCanvas = function(points){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle='#f00';
        ctx.beginPath();
        for (let i = 1; i < points.length; i++) {
             ctx.moveTo(points[i - 1].x, points[i - 1].y);
             ctx.lineTo(points[i].x, points[i].y);
              if (i === points.length - 1) {
                  ctx.moveTo(points[i].x, points[i].y);
                  ctx.lineTo(points[0].x, points[0].y);
              }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe("/topic"+topico, function (eventbody) {
                //alert(eventbody);
                //var point=JSON.parse(eventbody.body);
                if (topico.includes("newpoint")) {
                    var point = JSON.parse(eventbody.body);
                    addPointToCanvas(point);
                }
                else{
                    addPolygonToCanvas(JSON.parse(eventbody.body));
                }
            });
        });

    };
    
    

    return {

        connect: function (dibujoid) {
            var can = document.getElementById("canvas");
            var option = document.getElementById("conectar");
            topico = option.value + dibujoid;

            //websocket connection
            connectAndSubscribe();
            alert("Dibujo No"+dibujoid);
            if(topico.includes("newpoint")){
                if(window.PointerEvent){
                    can.addEventListener("pointerdown",function(evt){
                        var pt = getMousePosition(evt);
                        addPointToCanvas(pt);
                        addPointToTopic(pt);
                    })
                }
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