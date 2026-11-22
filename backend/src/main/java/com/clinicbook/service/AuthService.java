package com.clinicbook.service;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.dto.Mapper;
import com.clinicbook.exception.ApiException;
import com.clinicbook.model.Role;
import com.clinicbook.model.User;
import com.clinicbook.repository.UserRepository;
import com.clinicbook.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /** Public sign-up always creates a PATIENT. Doctors are created by the admin. */
    public AuthResponse register(RegisterRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        String phone = (r.phone() == null || r.phone().isBlank()) ? null : r.phone().trim();
        User user = users.save(new User(r.fullName().trim(), email, encoder.encode(r.password()), phone, Role.PATIENT));
        return new AuthResponse(jwt.generateToken(user), Mapper.user(user));
    }

    public AuthResponse login(LoginRequest r) {
        User user = users.findByEmail(r.email().trim().toLowerCase())
                .filter(u -> encoder.matches(r.password(), u.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));
        return new AuthResponse(jwt.generateToken(user), Mapper.user(user));
    }

    public UserDto me(String email) {
        return users.findByEmail(email)
                .map(Mapper::user)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
    }
}
