package com.mindplates.everyonesprint.framework.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${everyone_sprint.corsUrls}")
    private String[] corsUrls;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins(this.corsUrls)
                .allowedMethods("GET", "PUT", "POST", "DELETE", "OPTIONS").allowCredentials(true);
    }



}
