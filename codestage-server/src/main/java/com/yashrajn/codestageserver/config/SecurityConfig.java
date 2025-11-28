package com.yashrajn.codestageserver.config;

import com.yashrajn.codestageserver.auth.JwtAuthFilter;
import com.yashrajn.codestageserver.auth.JwtSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter, JwtSuccessHandler jwtHandler) throws Exception {
        http.authorizeHttpRequests(
                        req ->
                                req.requestMatchers("/", "/login", "/error").permitAll()
                                        .anyRequest().authenticated()
                ).httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .oauth2Login(oauth -> oauth.loginPage("/oauth2/authorization/google")
                        .successHandler(jwtHandler))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults());


        return http.build();
    }
}
