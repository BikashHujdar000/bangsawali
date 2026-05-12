package com.bauwalal.community.security;

import com.bauwalal.community.entity.AppUser;
import com.bauwalal.community.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final AppUserDetailsService userDetailsService;
    private final AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                String token = header.substring(7);
                String username = jwtService.parse(token).getSubject();
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    if (mustBlockUntilPasswordChange(request, username)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"message\":\"Password change required\"}");
                        return;
                    }
                }
            } catch (Exception ignored) {
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean mustBlockUntilPasswordChange(HttpServletRequest request, String username) {
        if (HttpMethod.POST.matches(request.getMethod())
                && "/api/auth/change-password".equals(request.getRequestURI())) {
            return false;
        }
        return appUserRepository.findByUsername(username)
                .map(AppUser::isPasswordChangeRequired)
                .orElse(false);
    }
}
