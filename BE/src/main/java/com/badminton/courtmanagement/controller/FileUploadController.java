package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.constants.AppConstants;
import com.badminton.courtmanagement.dto.ApiResponse;
import com.badminton.courtmanagement.utils.ValidationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Slf4j
@Tag(name = "File Upload", description = "API upload file và hình ảnh")
public class FileUploadController {
    
    private final Path uploadDir = Paths.get(AppConstants.UPLOAD_DIR).toAbsolutePath().normalize();
    
    public FileUploadController() {
        try {
            log.info("Creating upload directories at: {}", uploadDir.toAbsolutePath());
            Files.createDirectories(uploadDir);
            Files.createDirectories(uploadDir.resolve(AppConstants.COURT_IMAGES_DIR));
            Files.createDirectories(uploadDir.resolve(AppConstants.USER_IMAGES_DIR));
            Files.createDirectories(uploadDir.resolve(AppConstants.POST_IMAGES_DIR));
            log.info("Upload directories created successfully");
        } catch (Exception ex) {
            log.error("Could not create upload directory at: {} - Error: {}", uploadDir.toAbsolutePath(), ex.getMessage());
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }
    
    @PostMapping("/image")
    @Operation(summary = "Upload hình ảnh", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Upload thành công",
                    content = @Content(schema = @Schema(implementation = Map.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "File không hợp lệ"
            )
    })
    public ApiResponse<Map<String, String>> uploadImage(
            @Parameter(description = "File hình ảnh cần upload")
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Loại upload: court, user, post")
            @RequestParam(value = "type", defaultValue = "post") String type) {
        
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File trống!");
            }
            
            // Validate file type
            String originalFilename = file.getOriginalFilename();
            if (!ValidationUtils.isAllowedImageType(originalFilename)) {
                throw new RuntimeException("Chỉ hỗ trợ file hình ảnh: jpg, jpeg, png, gif");
            }
            
            // Validate file size
            if (file.getSize() > AppConstants.MAX_FILE_SIZE) {
                throw new RuntimeException("File quá lớn. Tối đa 10MB");
            }
            
            // Generate unique filename
            String fileExtension = ValidationUtils.getFileExtension(originalFilename);
            String fileName = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Determine subdirectory based on type
            String subDir = switch (type.toLowerCase()) {
                case "court" -> AppConstants.COURT_IMAGES_DIR;
                case "user" -> AppConstants.USER_IMAGES_DIR;
                case "post" -> AppConstants.POST_IMAGES_DIR;
                default -> AppConstants.POST_IMAGES_DIR;
            };
            
            // Save file
            Path targetLocation = uploadDir.resolve(subDir).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Generate URL
            String fileUrl = "/api/upload/images/" + subDir + fileName;
            
            log.info("File uploaded successfully: {}", fileName);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);
            response.put("originalName", originalFilename);
            response.put("size", String.valueOf(file.getSize()));
            
            return ApiResponse.success("Upload thành công", response);
            
        } catch (IOException ex) {
            log.error("Could not store file", ex);
            throw new RuntimeException("Không thể lưu file: " + ex.getMessage());
        }
    }
    
    @GetMapping("/images/{subDir}/{fileName:.+}")
    @Operation(summary = "Lấy hình ảnh theo tên file")
    public ResponseEntity<Resource> getImage(
            @Parameter(description = "Thư mục con") @PathVariable String subDir,
            @Parameter(description = "Tên file") @PathVariable String fileName) {
        
        try {
            Path filePath = uploadDir.resolve(subDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            log.error("File not found: {}", fileName, ex);
            return ResponseEntity.notFound().build();
        } catch (IOException ex) {
            log.error("Error reading file: {}", fileName, ex);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/images/{subDir}/{fileName:.+}")
    @Operation(summary = "Xóa hình ảnh", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<Void> deleteImage(
            @Parameter(description = "Thư mục con") @PathVariable String subDir,
            @Parameter(description = "Tên file") @PathVariable String fileName) {
        
        try {
            Path filePath = uploadDir.resolve(subDir).resolve(fileName).normalize();
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", fileName);
                return ApiResponse.success("Xóa file thành công", null);
            } else {
                return ApiResponse.error("File không tồn tại");
            }
        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileName, ex);
            throw new RuntimeException("Không thể xóa file: " + ex.getMessage());
        }
    }
} 