package com.badminton.courtmanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response wrapper cho pagination")
public class PageResponse<T> {
    
    @Schema(description = "Danh sách dữ liệu")
    private List<T> content;
    
    @Schema(description = "Trang hiện tại (0-indexed)", example = "0")
    private int page;
    
    @Schema(description = "Kích thước trang", example = "10")
    private int size;
    
    @Schema(description = "Tổng số phần tử", example = "100")
    private long totalElements;
    
    @Schema(description = "Tổng số trang", example = "10")
    private int totalPages;
    
    @Schema(description = "Có trang đầu tiên không", example = "true")
    private boolean first;
    
    @Schema(description = "Có trang cuối cùng không", example = "false")
    private boolean last;
    
    @Schema(description = "Có trang trước không", example = "false")
    private boolean hasPrevious;
    
    @Schema(description = "Có trang sau không", example = "true")
    private boolean hasNext;
    
    @Schema(description = "Số phần tử trong trang hiện tại", example = "10")
    private int numberOfElements;
    
    @Schema(description = "Trang có rỗng không", example = "false")
    private boolean empty;
    
    // Static method để tạo từ Spring Page object
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasPrevious(page.hasPrevious())
                .hasNext(page.hasNext())
                .numberOfElements(page.getNumberOfElements())
                .empty(page.isEmpty())
                .build();
    }
    
    // Static method để tạo từ List và metadata
    public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        return PageResponse.<T>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .hasPrevious(page > 0)
                .hasNext(page < totalPages - 1)
                .numberOfElements(content.size())
                .empty(content.isEmpty())
                .build();
    }
} 