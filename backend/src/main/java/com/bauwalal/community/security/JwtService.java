package com.bauwalal.community.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Component
public class JwtService {
    private final byte[] secretBytes;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    public String generate(String username, Collection<? extends GrantedAuthority> authorities) {
        Instant now = Instant.now();
        List<String> auths = authorities.stream().map(GrantedAuthority::getAuthority).toList();
        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .claim("authorities", auths)
                .signWith(Keys.hmacShaKeyFor(secretBytes))
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secretBytes)).build().parseSignedClaims(token).getPayload();
    }
}
