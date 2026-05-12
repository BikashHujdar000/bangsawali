package com.bauwalal.community.dto;

import lombok.Data;

import java.util.Set;

@Data
public class AuthResponse {
    private String token;
    private String username;
    private Set<String> authorities;
    /** When true, client should send the user to change-password before using the app. */
    private boolean passwordChangeRequired;
}
