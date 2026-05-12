package com.bauwalal.community.dto;

import com.bauwalal.community.enums.AppRole;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private Boolean active;
    private String branchCode;
    private AppRole role;
}
