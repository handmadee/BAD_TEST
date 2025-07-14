package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.CourtOwner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourtOwnerRepository extends JpaRepository<CourtOwner, Long> {
    
    Optional<CourtOwner> findByUserId(Long userId);
    
    Optional<CourtOwner> findByUserEmail(String email);
    
    @Query("SELECT co FROM CourtOwner co WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(co.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(co.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(co.businessName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<CourtOwner> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT co FROM CourtOwner co WHERE co.verificationStatus = :status")
    Page<CourtOwner> findByVerificationStatus(@Param("status") CourtOwner.VerificationStatus status, Pageable pageable);
} 