package com.lim.noteworkbench.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

//@Configuration
@Getter
@Setter
public class WebConfig implements WebMvcConfigurer {
    private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
