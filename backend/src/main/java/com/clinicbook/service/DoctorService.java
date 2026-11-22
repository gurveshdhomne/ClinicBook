package com.clinicbook.service;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.dto.Mapper;
import com.clinicbook.exception.ApiException;
import com.clinicbook.model.*;
import com.clinicbook.repository.AppointmentRepository;
import com.clinicbook.repository.DoctorRepository;
import com.clinicbook.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctors;
    private final UserRepository users;
    private final AppointmentRepository appointments;
    private final PasswordEncoder encoder;

    public DoctorService(DoctorRepository doctors, UserRepository users,
                         AppointmentRepository appointments, PasswordEncoder encoder) {
        this.doctors = doctors;
        this.users = users;
        this.appointments = appointments;
        this.encoder = encoder;
    }

    public List<DoctorResponse> search(String specialization, String q, boolean includeInactive) {
        String spec = specialization == null ? "" : specialization.trim().toLowerCase();
        String query = q == null ? "" : q.trim().toLowerCase();
        return doctors.findAll(Sort.by("id")).stream()
                .filter(d -> includeInactive || d.isActive())
                .filter(d -> spec.isEmpty() || d.getSpecialization().toLowerCase().equals(spec))
                .filter(d -> query.isEmpty()
                        || d.getUser().getFullName().toLowerCase().contains(query)
                        || d.getSpecialization().toLowerCase().contains(query))
                .map(Mapper::doctor)
                .toList();
    }

    public DoctorResponse get(Long id) {
        return Mapper.doctor(getEntity(id));
    }

    public Doctor getEntity(Long id) {
        return doctors.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));
    }

    /** Every slot of the day for this doctor, marked free or not. Slots are generated from working hours. */
    public List<SlotResponse> slots(Long doctorId, LocalDate date) {
        Doctor doctor = getEntity(doctorId);
        Set<LocalTime> taken = appointments
                .findByDoctorIdAndAppointmentDateAndStatusNot(doctorId, date, AppointmentStatus.CANCELLED)
                .stream().map(Appointment::getStartTime).collect(Collectors.toSet());
        LocalDateTime now = LocalDateTime.now();
        return allSlots(doctor).stream()
                .map(t -> new SlotResponse(t.toString(),
                        doctor.isActive() && !taken.contains(t) && LocalDateTime.of(date, t).isAfter(now)))
                .toList();
    }

    public static List<LocalTime> allSlots(Doctor d) {
        List<LocalTime> result = new ArrayList<>();
        LocalTime t = d.getWorkStart();
        while (true) {
            LocalTime end = t.plusMinutes(d.getSlotMinutes());
            if (end.isBefore(t) || end.isAfter(d.getWorkEnd())) break; // stop at closing time (or midnight wrap)
            result.add(t);
            t = end;
        }
        return result;
    }

    @Transactional
    public DoctorResponse create(CreateDoctorRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        if (!r.workEnd().isAfter(r.workStart())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work end time must be after work start time");
        }
        User user = users.save(new User(r.fullName().trim(), email, encoder.encode(r.password()), null, Role.DOCTOR));
        Doctor doctor = doctors.save(new Doctor(user, r.specialization().trim(), r.experienceYears(),
                r.consultationFee(), r.bio(), r.workStart(), r.workEnd(), r.slotMinutes()));
        return Mapper.doctor(doctor);
    }

    @Transactional
    public DoctorResponse setActive(Long id, boolean active) {
        Doctor doctor = getEntity(id);
        doctor.setActive(active);
        return Mapper.doctor(doctor);
    }
}
