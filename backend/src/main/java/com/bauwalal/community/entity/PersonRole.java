package com.bauwalal.community.entity;

import com.bauwalal.community.enums.CommunityRoleCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "person_roles")
@Getter
@Setter
public class PersonRole extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private CommunityRoleCode code;
}
