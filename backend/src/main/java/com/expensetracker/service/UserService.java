package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Unauthorized: No authenticated user found in security context");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getCurrency() != null ? request.getCurrency() : "INR"
        );
        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getCurrency());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getCurrency());
    }

    public UserDto getCurrentUserProfile() {
        User user = getCurrentAuthenticatedUser();
        return new UserDto(user.getId(), user.getFullName(), user.getEmail(), user.getCurrency(), user.getRole(), user.getCreatedAt());
    }

    @Transactional
    public UserDto updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentAuthenticatedUser();
        user.setFullName(request.getFullName().trim());
        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            user.setCurrency(request.getCurrency().trim().toUpperCase());
        }
        user = userRepository.save(user);
        return new UserDto(user.getId(), user.getFullName(), user.getEmail(), user.getCurrency(), user.getRole(), user.getCreatedAt());
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentAuthenticatedUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
