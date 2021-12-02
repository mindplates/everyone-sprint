package com.mindplates.everyonesprint.framework.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindplates.everyonesprint.framework.redis.listener.TopicMessageListener;
import com.mindplates.everyonesprint.framework.redis.template.JsonRedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

    @Value("${spring.redis.password}")
    private String password;

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

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(host);
        redisStandaloneConfiguration.setPort(port);
        redisStandaloneConfiguration.setPassword(password);
        LettuceConnectionFactory lettuceConnectionFactory = new LettuceConnectionFactory(redisStandaloneConfiguration);
        return lettuceConnectionFactory;


    }
}
