package com.mindplates.everyonesprint.framework.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.framework.redis.listener.TopicMessageListener;
import com.mindplates.everyonesprint.framework.redis.template.JsonRedisTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
public class RedisConfig {

    @Bean
    RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(topicMessageListener(), new PatternTopic("sendMessage"));

        return container;
    }

    @Bean
    public TopicMessageListener topicMessageListener() {
        return new TopicMessageListener();
    }

    @Bean
    public JsonRedisTemplate jsonRedisTemplate(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        return new JsonRedisTemplate<>(connectionFactory, objectMapper, Object.class);
    }
}
