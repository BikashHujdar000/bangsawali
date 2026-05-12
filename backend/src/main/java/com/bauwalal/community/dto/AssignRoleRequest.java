package com.bauwalal.community.dto;

import com.bauwalal.community.enums.CommunityRoleCode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRoleRequest {
    @NotNull
    private Long personId;
    @NotNull
    private Long districtId;
    @NotNull
    private CommunityRoleCode roleCode;
}
