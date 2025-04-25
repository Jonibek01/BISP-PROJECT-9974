package uz.temp.idealuy.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String username;
    private String password;

}
