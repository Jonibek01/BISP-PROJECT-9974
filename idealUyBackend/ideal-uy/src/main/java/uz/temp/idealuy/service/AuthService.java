package uz.temp.idealuy.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uz.temp.idealuy.model.dto.AuthResponse;
import uz.temp.idealuy.model.dto.LoginDto;
import uz.temp.idealuy.model.dto.RegisterRequest;
import uz.temp.idealuy.model.entity.Token;
import uz.temp.idealuy.model.entity.User;
import uz.temp.idealuy.repository.TokenRepository;
import uz.temp.idealuy.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenRepository tokenRepository;


    public AuthResponse login(LoginDto dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.getUsername(),
                        dto.getPassword()
                )
        );

        var user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow();
        var accessToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);
        return AuthResponse.builder()
                .token(accessToken)
                .userId(user.getId())
                .firstName(user.getUsername())
                .lastName(user.getUsername())
                .email(user.getUsername())
                .build();
    }

    public AuthResponse getProfile(HttpServletRequest request) throws Exception {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            var user = userRepository.findByUsername(username)
                    .orElseThrow();
            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .firstName(user.getUsername())
                    .lastName(user.getUsername())
                    .email(user.getUsername())
                    .build();
        }
        throw new Exception("User profile not found");
    }

    public AuthResponse register(RegisterRequest dto) {
        var user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();
        userRepository.save(user);

        var accessToken = jwtService.generateToken(user);
        saveUserToken(user, accessToken);
        return AuthResponse.builder()
                .token(accessToken)
                .userId(user.getId())
                .firstName(user.getUsername())
                .lastName(user.getUsername())
                .email(user.getUsername())
                .build();
    }

    private void saveUserToken(User user, String accessToken) {
        var token = Token.builder()
                .user(user)
                .token(accessToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty()) {
            return;
        }
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    public AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadCredentialsException("bad credentials");
        }

        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail != null) {
            var user = userRepository.findByUsername(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                return AuthResponse.builder()
                        .token(accessToken)
                        .userId(user.getId())
                        .firstName(user.getUsername())
                        .lastName(user.getUsername())
                        .email(user.getUsername())
                        .build();
            }
        }
        throw new UsernameNotFoundException("user not found");
    }

}
