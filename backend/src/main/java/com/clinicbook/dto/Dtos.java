package com.clinicbook.dto;

import com.clinicbook.model.Role;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;

/** All request and response shapes of the API, kept in one place. */
public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(
            @NotBlank(message = "Full name is required") @Size(max = 80, message = "Name is too long") String fullName,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, max = 60, message = "Password must be 6 to 60 characters") String password,
            @Pattern(regexp = "^$|^[0-9]{10}$", message = "Phone number must be 10 digits") String phone) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Password is required") String password) {}

    public record UserDto(Long id, String fullName, String email, String phone, Role role) {}

    public record AuthResponse(String token, UserDto user) {}

    public record DoctorResponse(Long id, String name, String email, String specialization, int experienceYears,
                                 int consultationFee, String bio, String workStart, String workEnd,
                                 int slotMinutes, boolean active) {}

    public record SlotResponse(String time, boolean available) {}

    public record CreateDoctorRequest(
            @NotBlank(message = "Doctor name is required") @Size(max = 80) String fullName,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, max = 60, message = "Password must be 6 to 60 characters") String password,
            @NotBlank(message = "Specialization is required") @Size(max = 60) String specialization,
            @Min(value = 0, message = "Experience cannot be negative") @Max(value = 60, message = "Experience is too high") int experienceYears,
            @Min(value = 0, message = "Fee cannot be negative") @Max(100000) int consultationFee,
            @Size(max = 600, message = "Bio is too long (max 600 characters)") String bio,
            @NotNull(message = "Work start time is required") LocalTime workStart,
            @NotNull(message = "Work end time is required") LocalTime workEnd,
            @Min(value = 10, message = "Slot length must be 10 to 120 minutes") @Max(value = 120, message = "Slot length must be 10 to 120 minutes") int slotMinutes) {}

    public record BookingRequest(
            @NotNull(message = "Doctor is required") Long doctorId,
            @NotNull(message = "Date is required") LocalDate date,
            @NotNull(message = "Time is required") LocalTime time,
            @Size(max = 300, message = "Reason is too long (max 300 characters)") String reason) {}

    public record AppointmentResponse(Long id, Long doctorId, String doctorName, String specialization,
                                      Long patientId, String patientName, String patientPhone,
                                      LocalDate date, String time, String status, String reason, int fee) {}

    public record StatsResponse(long doctors, long patients, long appointments,
                                long booked, long completed, long cancelled) {}
}
