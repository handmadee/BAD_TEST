package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.CourtOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourtOwnerRepository extends JpaRepository<CourtOwner, Long> {
    
    @Query("SELECT co FROM CourtOwner co WHERE co.user.id = :userId")
    Optional<CourtOwner> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT co FROM CourtOwner co WHERE co.user.email = :email")
    Optional<CourtOwner> findByUserEmail(@Param("email") String email);
    
    @Query("SELECT COUNT(co) FROM CourtOwner co WHERE co.status = :status")
    Long countByStatus(@Param("status") CourtOwner.OwnerStatus status);
    
    boolean existsByUserId(Long userId);
} 