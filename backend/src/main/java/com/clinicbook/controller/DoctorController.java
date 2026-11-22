package com.clinicbook.controller;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** Public endpoints: anyone can browse doctors and see free slots. */
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctors;

    public DoctorController(DoctorService doctors) {
        this.doctors = doctors;
    }

    @GetMapping
    public List<DoctorResponse> list(@RequestParam(required = false) String specialization,
                                     @RequestParam(required = false) String q) {
        return doctors.search(specialization, q, false);
    }

    @GetMapping("/{id}")
    public DoctorResponse get(@PathVariable Long id) {
        return doctors.get(id);
    }

    @GetMapping("/{id}/slots")
    public List<SlotResponse> slots(@PathVariable Long id,
                                    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return doctors.slots(id, date);
    }
}
