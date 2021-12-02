package com.mindplates.everyonesprint.framework.websocket.handler;


import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.common.vo.UserSession;
import com.mindplates.everyonesprint.framework.websocket.principal.StompPrincipal;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Map;

public class ProjectWebSocketHandler extends DefaultHandshakeHandler {



    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest req = ((ServletServerHttpRequest) request).getServletRequest();

            UserSession userSession = SessionUtil.getUserInfo(req);

            if (userSession != null) {
                attributes.put("USER_INFO", userSession);
            }

            if (userSession != null) {
                return new StompPrincipal(String.valueOf(userSession.getId()));
            }
        }

        return null;
    }
}
