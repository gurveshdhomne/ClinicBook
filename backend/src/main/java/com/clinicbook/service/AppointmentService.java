package com.clinicbook.service;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.dto.Mapper;
import com.clinicbook.exception.ApiException;
import com.clinicbook.model.*;
import com.clinicbook.repository.AppointmentRepository;
import com.clinicbook.repository.DoctorRepository;
import com.clinicbook.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    private static final int MAX_DAYS_AHEAD = 30;

    private final AppointmentRepository appointments;
    private final DoctorRepository doctors;
    private final UserRepository users;

    public AppointmentService(AppointmentRepository appointments, DoctorRepository doctors, UserRepository users) {
        this.appointments = appointments;
        this.doctors = doctors;
        this.users = users;
    }

    /**
     * Books a slot. The doctor row is locked (SELECT ... FOR UPDATE) for the whole transaction, so if two
     * patients click the same slot at the same moment, one waits, then sees the slot is taken and gets a 409.
     */
    @Transactional
    public AppointmentResponse book(String patientEmail, BookingRequest r) {
        User patient = users.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
        Doctor doctor = doctors.findByIdForUpdate(r.doctorId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor not found"));

        if (!doctor.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This doctor is not taking bookings right now");
        }

        LocalDate date = r.date();
        LocalTime time = r.time().withSecond(0).withNano(0);

        if (!LocalDateTime.of(date, time).isAfter(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose a time in the future");
        }
        if (date.isAfter(LocalDate.now().plusDays(MAX_DAYS_AHEAD))) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Appointments can be booked up to " + MAX_DAYS_AHEAD + " days ahead");
        }
        if (!DoctorService.allSlots(doctor).contains(time)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "That time is not one of this doctor's slots");
        }
        if (appointments.existsByPatientIdAndAppointmentDateAndStartTimeAndStatus(
                patient.getId(), date, time, AppointmentStatus.BOOKED)) {
            throw new ApiException(HttpStatus.CONFLICT, "You already have an appointment at this time");
        }
        if (appointments.existsByDoctorIdAndAppointmentDateAndStartTimeAndStatusNot(
                doctor.getId(), date, time, AppointmentStatus.CANCELLED)) {
            throw new ApiException(HttpStatus.CONFLICT, "That slot was just booked by someone else. Please pick another.");
        }

        String reason = (r.reason() == null || r.reason().isBlank()) ? null : r.reason().trim();
        return Mapper.appointment(appointments.save(new Appointment(patient, doctor, date, time, reason)));
    }

    public List<AppointmentResponse> forPatient(String email) {
        User patient = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
        return appointments.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patient.getId())
                .stream().map(Mapper::appointment).toList();
    }

    public List<AppointmentResponse> forDoctor(String email) {
        Doctor doctor = doctors.findByUserEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        return appointments.findByDoctorIdOrderByAppointmentDateAscStartTimeAsc(doctor.getId())
                .stream().map(Mapper::appointment).toList();
    }

    public List<AppointmentResponse> all() {
        return appointments.findAllByOrderByAppointmentDateDescStartTimeDesc()
                .stream().map(Mapper::appointment).toList();
    }

    @Transactional
    public AppointmentResponse cancel(Long id, String email, Role role) {
        Appointment a = find(id);
        boolean allowed = role == Role.ADMIN
                || (role == Role.PATIENT && a.getPatient().getEmail().equals(email))
                || (role == Role.DOCTOR && a.getDoctor().getUser().getEmail().equals(email));
        if (!allowed) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot change this appointment");
        }
        if (a.getStatus() != AppointmentStatus.BOOKED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only upcoming appointments can be cancelled");
        }
        a.setStatus(AppointmentStatus.CANCELLED);
        return Mapper.appointment(a);
    }

    @Transactional
    public AppointmentResponse complete(Long id, String doctorEmail) {
        Appointment a = find(id);
        if (!a.getDoctor().getUser().getEmail().equals(doctorEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This is not your appointment");
        }
        if (a.getStatus() != AppointmentStatus.BOOKED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only upcoming appointments can be completed");
        }
        a.setStatus(AppointmentStatus.COMPLETED);
        return Mapper.appointment(a);
    }

    private Appointment find(Long id) {
        return appointments.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }
}
