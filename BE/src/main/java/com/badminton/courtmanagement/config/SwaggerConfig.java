package com.badminton.courtmanagement.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Badminton Court Management API",
                description = "API quản lý sân cầu lông với tính năng đặt sân, thanh toán VietQR",
                version = "1.0.0",
                contact = @Contact(
                        name = "Badminton Team",
                        email = "support@badminton.com",
                        url = "https://badminton.com"
                ),
                license = @License(
                        name = "MIT License",
                        url = "https://opensource.org/licenses/MIT"
                )
        ),
        servers = {
                @Server(
                        description = "Local Development Server",
                        url = "http://localhost:8081"
                ),
                @Server(
                        description = "Production Server",
                        url = "https://api.badminton.com"
                )
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        description = "JWT Authorization header sử dụng Bearer scheme. Nhập 'Bearer' [space] và token vào field bên dưới."
)
public class SwaggerConfig {
} 