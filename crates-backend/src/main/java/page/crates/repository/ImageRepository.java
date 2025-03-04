package page.crates.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import page.crates.entity.Image;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
}
