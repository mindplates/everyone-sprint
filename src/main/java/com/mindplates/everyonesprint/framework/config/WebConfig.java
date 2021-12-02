package com.mindplates.everyonesprint.framework.config;

import com.mindplates.everyonesprint.biz.user.service.UserService;
import com.mindplates.everyonesprint.common.util.SessionUtil;
import com.mindplates.everyonesprint.framework.interceptor.LoginCheckInterceptor;
import com.mindplates.everyonesprint.framework.resolver.MethodArgumentResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    SessionUtil sessionUtil;
    @Autowired
    MessageSourceAccessor messageSourceAccessor;
    @Autowired
    UserService userService;

    @Value("${spring.profiles.active}")
    private String activeProfile;
    @Value("${everyone_sprint.corsUrls}")
    private String[] corsUrls;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins(this.corsUrls)
                .allowedMethods("GET", "PUT", "POST", "DELETE", "OPTIONS").allowCredentials(true);
    }

    @Bean
    public ReloadableResourceBundleMessageSource messageSource() {

        ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();

        source.setBasename("classpath:/messages/message");
        source.setDefaultEncoding("UTF-8");
        source.setCacheSeconds(60);
        source.setUseCodeAsDefaultMessage(true);
        return source;

    }

    @Bean
    public MessageSourceAccessor messageSourceAccessor() {
        MessageSourceAccessor messageSourceAccessor = new MessageSourceAccessor(messageSource());
        return messageSourceAccessor;
    }

    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new MethodArgumentResolver());
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());

        registry.addInterceptor(
                new LoginCheckInterceptor(this.userService, this.sessionUtil, this.messageSourceAccessor, this.activeProfile))
                .addPathPatterns("/**")
                .excludePathPatterns("/test/**/")
                .excludePathPatterns("/v3/**")
                .excludePathPatterns("/webjars/**")
                .excludePathPatterns("/swagger-ui/**")
                .excludePathPatterns("/swagger**")
                .excludePathPatterns("/swagger-resources/**")
                .excludePathPatterns("/error");
    }


    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setSameSite("none");
        serializer.setUseSecureCookie(true);
        return serializer;
    }

}
