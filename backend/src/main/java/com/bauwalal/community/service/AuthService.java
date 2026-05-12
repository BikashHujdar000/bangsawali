package com.bauwalal.community.service;

import com.bauwalal.community.dto.AuthResponse;
import com.bauwalal.community.dto.ChangePasswordRequest;
import com.bauwalal.community.dto.LoginRequest;
import com.bauwalal.community.entity.AppUser;
import com.bauwalal.community.repository.AppUserRepository;
import com.bauwalal.community.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        AuthResponse response = new AuthResponse();
        response.setUsername(request.getUsername());
        response.setAuthorities(authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .collect(HashSet::new, HashSet::add, HashSet::addAll));
        response.setToken(jwtService.generate(request.getUsername(), authentication.getAuthorities()));
        response.setPasswordChangeRequired(user.isPasswordChangeRequired());
        return response;
    }

    @Transactional
    public AuthResponse changePassword(String username, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangeRequired(false);
        appUserRepository.save(user);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getNewPassword()));
        AuthResponse response = new AuthResponse();
        response.setUsername(username);
        response.setAuthorities(authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .collect(HashSet::new, HashSet::add, HashSet::addAll));
        response.setToken(jwtService.generate(username, authentication.getAuthorities()));
        response.setPasswordChangeRequired(false);
        return response;
    }
}
