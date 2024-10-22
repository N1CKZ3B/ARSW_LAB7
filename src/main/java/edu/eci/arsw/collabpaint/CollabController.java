package edu.eci.arsw.collabpaint;
import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
@Controller
public class CollabController {
    @MessageMapping("/newpoint")
    @SendTo("/stompendpoint")
    public Point point(Point message) throws Exception {
        return new Point(message.getX(), message.getY());
    }
}