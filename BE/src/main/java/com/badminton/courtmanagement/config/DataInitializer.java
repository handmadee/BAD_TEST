package com.badminton.courtmanagement.config;

import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultAdmin();
    }

    private void initializeDefaultAdmin() {
        // Check if admin already exists
        if (userRepository.findByEmail("admin@badminton.com").isPresent()) {
            log.info("Default admin account already exists");
            return;
        }

        // Create default admin account
        User admin = User.builder()
                .username("admin")
                .email("admin@badminton.com")
                .fullName("System Administrator")
                .password(passwordEncoder.encode("admin123")) // Default password
                .phone("0123456789")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(User.Gender.OTHER)
                .role(User.UserRole.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .bio("System Administrator Account")
                .location("Đà Nẵng, Việt Nam")
                .skillLevel(User.SkillLevel.EXCELLENT)
                .build();

        userRepository.save(admin);
        
        log.info("✅ Default admin account created successfully!");
        log.info("📧 Email: admin@badminton.com");
        log.info("🔐 Password: admin123");
        log.info("⚠️  Please change the default password after first login!");
    }
} 