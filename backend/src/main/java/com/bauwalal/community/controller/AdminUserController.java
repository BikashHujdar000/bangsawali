package com.bauwalal.community.controller;

import com.bauwalal.community.dto.*;
import com.bauwalal.community.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping("/users")
    public List<AdminUserResponse> listUsers() {
        return adminUserService.listUsers();
    }

    @PostMapping("/users")
    public AdminUserResponse createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return adminUserService.createUser(request);
    }

    @PutMapping("/users/{id}")
    public AdminUserResponse updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return adminUserService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        adminUserService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/reset-password")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody AdminResetPasswordRequest request) {
        adminUserService.resetPassword(id, request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

}
