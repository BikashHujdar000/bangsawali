package com.bauwalal.community.dto;

import com.bauwalal.community.enums.AppRole;
import lombok.Data;

import java.util.Set;

@Data
public class AdminUserResponse {
    private Long id;
    private String username;
    private boolean active;
    private String branchCode;
    private AppRole role;
    private Set<String> permissions;
}
