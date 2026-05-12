package com.bauwalal.community.security;

import com.bauwalal.community.entity.AppUser;
import com.bauwalal.community.enums.AppRole;
import com.bauwalal.community.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        AppRole role = user.getRole() == null ? AppRole.USER : user.getRole();
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        if (role == AppRole.SUPER_ADMIN || role == AppRole.ADMIN) {
            authorities.add(new SimpleGrantedAuthority("TX_MANAGE"));
            authorities.add(new SimpleGrantedAuthority("USER_MANAGE"));
            authorities.add(new SimpleGrantedAuthority("DATA_MANAGE"));
        }
        if (role == AppRole.SUPER_ADMIN) {
            authorities.add(new SimpleGrantedAuthority("PASSWORD_RESET"));
        }
        return new User(user.getUsername(), user.getPasswordHash(), user.isActive(),
                true, true, true, authorities);
    }
}
