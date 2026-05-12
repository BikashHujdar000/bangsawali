package com.bauwalal.community.service;

import com.bauwalal.community.dto.*;
import com.bauwalal.community.entity.AppUser;
import com.bauwalal.community.enums.AppRole;
import com.bauwalal.community.repository.AppUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserResponse> listUsers() {
        return appUserRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPasswordChangeRequired(true);
        user.setActive(request.isActive());
        user.setBranchCode(request.getBranchCode());
        user.setRole(request.getRole());
        return toResponse(appUserRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateUser(Long userId, AdminUserUpdateRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBranchCode(request.getBranchCode());
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        return toResponse(appUserRepository.save(user));
    }

    @Transactional
    public void deactivateUser(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        appUserRepository.save(user);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(true);
        appUserRepository.save(user);
    }

    private AdminUserResponse toResponse(AppUser user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setActive(user.isActive());
        response.setBranchCode(user.getBranchCode());
        response.setRole(user.getRole());
        response.setPermissions(resolvePermissionsByRole(user.getRole()));
        return response;
    }

    private Set<String> resolvePermissionsByRole(AppRole role) {
        return switch (role) {
            case SUPER_ADMIN -> Set.of("TX_MANAGE", "USER_MANAGE", "DATA_MANAGE", "PASSWORD_RESET");
            case ADMIN -> Set.of("TX_MANAGE", "DATA_MANAGE");
            case USER -> Set.of("READ_ONLY");
        };
    }
}
