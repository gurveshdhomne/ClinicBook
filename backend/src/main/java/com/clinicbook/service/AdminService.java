package com.clinicbook.service;

import com.clinicbook.dto.Dtos.StatsResponse;
import com.clinicbook.model.AppointmentStatus;
import com.clinicbook.model.Role;
import com.clinicbook.repository.AppointmentRepository;
import com.clinicbook.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository users;
    private final AppointmentRepository appointments;

    public AdminService(UserRepository users, AppointmentRepository appointments) {
        this.users = users;
        this.appointments = appointments;
    }

    public StatsResponse stats() {
        return new StatsResponse(
                users.countByRole(Role.DOCTOR),
                users.countByRole(Role.PATIENT),
                appointments.count(),
                appointments.countByStatus(AppointmentStatus.BOOKED),
                appointments.countByStatus(AppointmentStatus.COMPLETED),
                appointments.countByStatus(AppointmentStatus.CANCELLED));
    }
}
