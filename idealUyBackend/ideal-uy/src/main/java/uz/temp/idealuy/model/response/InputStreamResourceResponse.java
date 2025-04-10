package uz.temp.idealuy.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InputStreamResourceResponse {

    private InputStreamResource inputStreamResource;
    private MediaType contentType;

}
