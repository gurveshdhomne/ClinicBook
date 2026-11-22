package com.clinicbook.dto;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.model.Appointment;
import com.clinicbook.model.Doctor;
import com.clinicbook.model.User;

/** Converts entities into response objects so entities (and password hashes) never leave the server. */
public final class Mapper {
    private Mapper() {}

    public static UserDto user(User u) {
        return new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole());
    }

    public static DoctorResponse doctor(Doctor d) {
        return new DoctorResponse(d.getId(), d.getUser().getFullName(), d.getUser().getEmail(),
                d.getSpecialization(), d.getExperienceYears(), d.getConsultationFee(), d.getBio(),
                d.getWorkStart().toString(), d.getWorkEnd().toString(), d.getSlotMinutes(), d.isActive());
    }

    public static AppointmentResponse appointment(Appointment a) {
        Doctor d = a.getDoctor();
        User p = a.getPatient();
        return new AppointmentResponse(a.getId(), d.getId(), d.getUser().getFullName(), d.getSpecialization(),
                p.getId(), p.getFullName(), p.getPhone(), a.getAppointmentDate(),
                a.getStartTime().toString(), a.getStatus().name(), a.getReason(), d.getConsultationFee());
    }
}
