package com.clinicbook.security;

import com.clinicbook.model.Role;
import org.springframework.security.core.Authentication;

public final class AuthUtil {
    private AuthUtil() {}

    public static Role roleOf(Authentication auth) {
        String authority = auth.getAuthorities().iterator().next().getAuthority();
        return Role.valueOf(authority.replace("ROLE_", ""));
    }
}
