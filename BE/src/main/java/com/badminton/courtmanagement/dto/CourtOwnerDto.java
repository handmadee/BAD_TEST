package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.CourtOwner;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin chủ sân")
public class CourtOwnerDto {
    
    @Schema(description = "ID chủ sân", example = "1")
    private Long id;
    
    @Schema(description = "Thông tin user")
    private UserDto user;
    
    @Schema(description = "Tên doanh nghiệp", example = "Công ty TNHH ABC")
    private String businessName;
    
    @Schema(description = "Số điện thoại doanh nghiệp", example = "0123456789")
    private String businessPhone;
    
    @Schema(description = "Email doanh nghiệp", example = "business@example.com")
    private String businessEmail;
    
    @Schema(description = "Mô tả doanh nghiệp")
    private String description;
    
    @Schema(description = "Tên ngân hàng", example = "MB Bank")
    private String bankName;
    
    @Schema(description = "Số tài khoản ngân hàng", example = "0123456789")
    private String bankAccount;
    
    @Schema(description = "Mã BIN ngân hàng", example = "970422")
    private String bankBin;
    
    @Schema(description = "Tên chủ tài khoản", example = "Nguyen Van A")
    private String accountHolderName;
    
    @Schema(description = "Trạng thái xác minh chủ sân")
    private CourtOwner.VerificationStatus verificationStatus;
    
    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;
    
    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Thời gian xác minh")
    private LocalDateTime verifiedAt;
} 