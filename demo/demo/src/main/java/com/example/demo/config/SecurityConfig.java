package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. 關閉 CSRF 保護（開發測試 API 時通常先關閉，方便 Postman 測試）
            .csrf(csrf -> csrf.disable())
            
            // 2. 設定所有請求都「放行」 (permitAll)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() 
            )
            
            // 3. 允許使用 Frame (如果你有使用 H2 控制台之類的工具)
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}