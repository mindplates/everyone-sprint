package com.mindplates.everyonesprint.framework.config;

import com.mindplates.everyonesprint.framework.websocket.handler.ProjectWebSocketHandler;
import com.mindplates.everyonesprint.framework.websocket.interceptor.WebSocketInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${everyone_sprint.corsUrls}")
    private String[] corsUrls;

    @Autowired
    private WebSocketInterceptor webSocketInterceptor;

    public void configureMessageBroker(MessageBrokerRegistry brokerRegistry) {
        brokerRegistry.enableSimpleBroker("/sub");
        brokerRegistry.setApplicationDestinationPrefixes("/pub");
    }

    public void registerStompEndpoints(StompEndpointRegistry endpointRegistry) {
        endpointRegistry.addEndpoint("/ws-stomp").setAllowedOrigins(corsUrls).setHandshakeHandler(new ProjectWebSocketHandler()).withSockJS().setInterceptors(webSocketInterceptor);
    }

}
