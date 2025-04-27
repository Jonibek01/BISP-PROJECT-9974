package uz.temp.idealuy.controller;

import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.temp.idealuy.model.dto.AuthResponse;
import uz.temp.idealuy.model.dto.LoginDto;
import uz.temp.idealuy.model.dto.RegisterRequest;
import uz.temp.idealuy.service.AuthService;


@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest dto){
        return ResponseEntity.ok(service.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginDto dto
    ) throws BadRequestException {
        var response = service.login(dto);
        return ResponseEntity.ok(response);
    }
}
