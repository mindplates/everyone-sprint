package com.mindplates.everyonesprint.framework.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.Executor;

@Configuration
public class ThreadConfig implements WebMvcConfigurer {


    @Bean(name = "executor")
    public Executor executor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setCorePoolSize(16);
        taskExecutor.setMaxPoolSize(64);
        taskExecutor.setQueueCapacity(256);
        taskExecutor.setThreadNamePrefix("executor-");
        taskExecutor.initialize();
        return taskExecutor;
    }


}
