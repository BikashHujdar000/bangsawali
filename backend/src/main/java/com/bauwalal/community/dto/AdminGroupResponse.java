package com.bauwalal.community.dto;

import lombok.Data;

import java.util.Set;

@Data
public class AdminGroupResponse {
    private Long id;
    private String name;
    private Set<String> permissions;
}
