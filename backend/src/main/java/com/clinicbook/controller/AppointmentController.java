package com.clinicbook.controller;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.security.AuthUtil;
import com.clinicbook.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse book(@Valid @RequestBody BookingRequest request, Authentication auth) {
        return service.book(auth.getName(), request);
    }

    @GetMapping("/my")
    public List<AppointmentResponse> mine(Authentication auth) {
        return service.forPatient(auth.getName());
    }

    @PatchMapping("/{id}/cancel")
    public AppointmentResponse cancel(@PathVariable Long id, Authentication auth) {
        return service.cancel(id, auth.getName(), AuthUtil.roleOf(auth));
    }
}
