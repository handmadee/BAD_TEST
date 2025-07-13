package com.badminton.courtmanagement.service.impl;

import com.badminton.courtmanagement.config.JwtUtil;
import com.badminton.courtmanagement.constants.ErrorConstants;
import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.exception.ResourceNotFoundException;
import com.badminton.courtmanagement.exception.ValidationException;
import com.badminton.courtmanagement.mapper.UserMapper;
import com.badminton.courtmanagement.repository.UserRepository;
import com.badminton.courtmanagement.service.AuthService;
import com.badminton.courtmanagement.service.CustomUserDetailsService;
import com.badminton.courtmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.debug("Registering new user with email: {}", request.getEmail());
        
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Tên đăng nhập đã tồn tại");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException(ErrorConstants.EMAIL_ALREADY_EXISTS);
        }

        // Kiểm tra số điện thoại đã tồn tại
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ValidationException(ErrorConstants.PHONE_ALREADY_EXISTS);
        }

        // Kiểm tra mật khẩu xác nhận
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException(ErrorConstants.PASSWORD_MISMATCH);
        }

        // Tạo user mới
        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully with id: {}", user.getId());

        // Tạo tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .build())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.debug("User login attempt with email: {}", request.getEmail());
        
        // Xác thực
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Lấy user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));

        // Tạo tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        log.info("User logged in successfully: {}", user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .build())
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        log.debug("Refreshing token");
        
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new ValidationException(ErrorConstants.INVALID_TOKEN);
        }

        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtUtil.generateToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .build())
                .build();
    }

    @Override
    public UserDto getCurrentUserProfile() {
        log.debug("Getting current user profile");
        
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        log.debug("Updating user profile");
        
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));

        // Kiểm tra email mới có trùng với user khác không
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException(ErrorConstants.EMAIL_ALREADY_EXISTS);
        }

        // Kiểm tra phone mới có trùng với user khác không
        if (!user.getPhone().equals(request.getPhoneNumber()) && 
            userRepository.existsByPhone(request.getPhoneNumber())) {
            throw new ValidationException(ErrorConstants.PHONE_ALREADY_EXISTS);
        }

        // Cập nhật thông tin
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        // user.setAddress(request.getAddress()); // TODO: Add address field to User entity
        user.setProfileImage(request.getProfileImage());

        user = userRepository.save(user);
        log.info("User profile updated successfully: {}", user.getId());

        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        log.debug("Changing user password");
        
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException(ErrorConstants.INVALID_CURRENT_PASSWORD);
        }

        // Kiểm tra mật khẩu mới và xác nhận
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException(ErrorConstants.PASSWORD_MISMATCH);
        }

        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", user.getId());
    }

    @Override
    public UserDto getUserById(Long userId) {
        log.debug("Getting user by id: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND, userId));
        
        return userMapper.toDto(user);
    }
} 