package com.badminton.courtmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Transaction extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @NotBlank
    @Column(name = "transaction_id", nullable = false, unique = true, length = 100)
    private String transactionId;
    
    @NotNull
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @NotBlank
    @Column(name = "bank_account", nullable = false, length = 50)
    private String bankAccount;
    
    @Column(name = "bank_name", length = 100)
    private String bankName;
    
    @NotNull
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type = TransactionType.CREDIT;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status = TransactionStatus.PENDING;
    
    @Column(name = "casso_id", length = 50)
    private String cassoId;
    
    @Column(name = "webhook_data", columnDefinition = "TEXT")
    private String webhookData;
    
    public enum TransactionType {
        CREDIT, DEBIT
    }
    
    public enum TransactionStatus {
        PENDING, PROCESSED, FAILED, CANCELLED
    }
} 