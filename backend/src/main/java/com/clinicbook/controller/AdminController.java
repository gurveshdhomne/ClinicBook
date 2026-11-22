package com.clinicbook.controller;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.service.AdminService;
import com.clinicbook.service.AppointmentService;
import com.clinicbook.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;
    private final DoctorService doctors;
    private final AppointmentService appointments;

    public AdminController(AdminService admin, DoctorService doctors, AppointmentService appointments) {
        this.admin = admin;
        this.doctors = doctors;
        this.appointments = appointments;
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return admin.stats();
    }

    @GetMapping("/appointments")
    public List<AppointmentResponse> allAppointments() {
        return appointments.all();
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> allDoctors() {
        return doctors.search(null, null, true);
    }

    @PostMapping("/doctors")
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorResponse addDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return doctors.create(request);
    }

    @PatchMapping("/doctors/{id}/active")
    public DoctorResponse setActive(@PathVariable Long id, @RequestParam boolean value) {
        return doctors.setActive(id, value);
    }
}
