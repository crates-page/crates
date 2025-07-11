package page.crates.controller.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PublicUser {
    private Long id;
    private String spotifyId;
    private String displayName;
    private String handle;
    private String bio;
    private boolean privateProfile;
    private Set<Image> images;
}