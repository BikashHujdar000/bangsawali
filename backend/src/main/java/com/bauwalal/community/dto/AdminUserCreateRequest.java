package com.bauwalal.community.dto;

import com.bauwalal.community.enums.AppRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUserCreateRequest {
    @NotBlank
    private String username;
    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    private boolean active = true;
    private String branchCode;
    @NotNull
    private AppRole role;
}
