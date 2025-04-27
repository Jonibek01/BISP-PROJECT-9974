package uz.temp.idealuy.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    private final TokenRepository tokenRepository;


    public AuthResponse login(LoginDto dto) throws BadRequestException {
        var userOptional = userRepository.findByUsername(dto.getUsername());

        if (userOptional.isEmpty()) throw new BadRequestException("Bad credentials");
        User user = userOptional.get();

        var accessToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);
        return AuthResponse.builder()
                .token(accessToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
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
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .build();
        }
        throw new Exception("User profile not found");
    }

    public AuthResponse register(RegisterRequest dto) {
        var user = User.builder()
                .username(dto.getUsername())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .phoneNumber(dto.getPhoneNumber())
                .build();
        userRepository.save(user);

        var accessToken = jwtService.generateToken(user);
        saveUserToken(user, accessToken);
        return AuthResponse.builder()
                .token(accessToken)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
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

}
