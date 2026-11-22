package com.clinicbook.controller;

import com.clinicbook.dto.Dtos.AppointmentResponse;
import com.clinicbook.service.AppointmentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Endpoints used by a logged-in doctor to manage their own appointments. */
@RestController
@RequestMapping("/api/doctor")
public class DoctorPanelController {

    private final AppointmentService service;

    public DoctorPanelController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping("/appointments")
    public List<AppointmentResponse> myAppointments(Authentication auth) {
        return service.forDoctor(auth.getName());
    }

    @PatchMapping("/appointments/{id}/complete")
    public AppointmentResponse complete(@PathVariable Long id, Authentication auth) {
        return service.complete(id, auth.getName());
    }
}
