package com.badminton.courtmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "court_owners")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CourtOwner extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "User ID không được để trống")
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    @Column(name = "business_name", nullable = false, length = 200)
    private String businessName;
    
    @Column(name = "business_license", length = 50)
    private String businessLicense;
    
    @Column(name = "tax_code", length = 20)
    private String taxCode;
    
    @Column(length = 500)
    private String address;
    
    // Thông tin ngân hàng bắt buộc cho VietQR
    @NotBlank(message = "Tên ngân hàng không được để trống")
    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;
    
    @NotBlank(message = "Số tài khoản không được để trống")
    @Column(name = "bank_account", nullable = false, length = 50)
    private String bankAccount;
    
    @NotBlank(message = "Mã BIN ngân hàng không được để trống")
    @Column(name = "bank_bin", nullable = false, length = 10)
    private String bankBin;
    
    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OwnerStatus status = OwnerStatus.PENDING;
    
    // Relationships
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Court> courts;
    
    // Enums
    public enum OwnerStatus {
        PENDING, VERIFIED, SUSPENDED, REJECTED
    }
} 