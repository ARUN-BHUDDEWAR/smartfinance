package com.smartfinance.service;

import com.smartfinance.domain.Role;
import com.smartfinance.domain.RoleName;
import com.smartfinance.domain.User;
import com.smartfinance.dto.AuthResponseDto;
import com.smartfinance.dto.LoginRequestDto;
import com.smartfinance.dto.RegisterRequestDto;
import com.smartfinance.repository.RoleRepository;
import com.smartfinance.repository.UserRepository;
import com.smartfinance.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
            .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.getRoles().add(userRole);
        userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .authorities(RoleName.ROLE_USER.name())
            .build();
        return createResponse(userDetails, RoleName.ROLE_USER);
    }

    public AuthResponseDto login(LoginRequestDto request) {
        final Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Authenticated user has no role"));
        return new AuthResponseDto(
            jwtUtils.generateToken(userDetails),
            userDetails.getUsername(),
            role
        );
    }

    private AuthResponseDto createResponse(UserDetails userDetails, RoleName role) {
        return new AuthResponseDto(
            jwtUtils.generateToken(userDetails),
            userDetails.getUsername(),
            role.name()
        );
    }
}
