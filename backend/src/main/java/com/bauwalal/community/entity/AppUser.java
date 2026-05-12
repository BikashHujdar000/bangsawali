package com.bauwalal.community.entity;

import com.bauwalal.community.enums.AppRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "app_users")
@Getter
@Setter
public class AppUser extends BaseEntity {
    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active = true;

    @Column(length = 64)
    private String branchCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "app_role", length = 32)
    private AppRole role = AppRole.USER;

    /** When true, the user must set a new password before other API access (except change-password). */
    @Column(name = "password_change_required", nullable = false, columnDefinition = "boolean default false not null")
    private boolean passwordChangeRequired = false;
}
