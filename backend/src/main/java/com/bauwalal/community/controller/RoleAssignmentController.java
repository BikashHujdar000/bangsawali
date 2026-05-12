package com.bauwalal.community.controller;

import com.bauwalal.community.dto.AssignRoleRequest;
import com.bauwalal.community.entity.PersonRoleMap;
import com.bauwalal.community.service.RoleAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community-roles")
@RequiredArgsConstructor
public class RoleAssignmentController {
    private final RoleAssignmentService roleAssignmentService;

    @PostMapping("/assign")
    public PersonRoleMap assign(@RequestBody AssignRoleRequest request) {
        return roleAssignmentService.assign(request);
    }
}
