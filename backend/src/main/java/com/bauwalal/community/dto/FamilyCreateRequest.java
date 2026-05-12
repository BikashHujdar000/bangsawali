package com.bauwalal.community.dto;

import lombok.Data;

@Data
public class FamilyCreateRequest {
    private String primaryPersonNameEn;
    private String primaryPersonNameNp;
    private String description;
}
