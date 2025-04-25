package uz.temp.idealuy.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.temp.idealuy.model.dto.AuthResponse;
import uz.temp.idealuy.service.AuthService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> profile(HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(authService.getProfile(httpServletRequest));
    }

}
