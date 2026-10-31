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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    private static final String JWT_SECRET =
        "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder passwordEncoder;
    private JwtUtils jwtUtils;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtUtils = new JwtUtils(JWT_SECRET, 900_000);
        authService = new AuthService(
            userRepository,
            roleRepository,
            passwordEncoder,
            authenticationManager,
            jwtUtils
        );
    }

    @Test
    void registrationHashesPasswordAndReturnsValidJwt() {
        Role userRole = new Role(RoleName.ROLE_USER);
        when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponseDto response = authService.register(
            new RegisterRequestDto("student@example.com", "plain-password")
        );

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(savedUser.getPasswordHash()).isNotEqualTo("plain-password");
        assertThat(passwordEncoder.matches("plain-password", savedUser.getPasswordHash())).isTrue();
        assertThat(response.email()).isEqualTo("student@example.com");
        assertThat(response.role()).isEqualTo("ROLE_USER");
        assertThat(jwtUtils.extractUsername(response.token())).isEqualTo("student@example.com");
    }

    @Test
    void loginAuthenticatesAndReturnsValidJwt() {
        UserDetails principal = org.springframework.security.core.userdetails.User
            .withUsername("student@example.com")
            .password(passwordEncoder.encode("plain-password"))
            .authorities("ROLE_USER")
            .build();
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
            principal, null, principal.getAuthorities()
        );
        when(authenticationManager.authenticate(any(Authentication.class)))
            .thenReturn(authentication);

        AuthResponseDto response = authService.login(
            new LoginRequestDto("student@example.com", "plain-password")
        );

        assertThat(response.email()).isEqualTo("student@example.com");
        assertThat(response.role()).isEqualTo("ROLE_USER");
        assertThat(jwtUtils.isTokenValid(response.token(), principal)).isTrue();
    }
}
