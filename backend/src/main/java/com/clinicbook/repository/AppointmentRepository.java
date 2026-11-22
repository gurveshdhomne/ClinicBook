package com.clinicbook.repository;

import com.clinicbook.model.Appointment;
import com.clinicbook.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate date, AppointmentStatus status);

    boolean existsByDoctorIdAndAppointmentDateAndStartTimeAndStatusNot(
            Long doctorId, LocalDate date, LocalTime time, AppointmentStatus status);

    boolean existsByPatientIdAndAppointmentDateAndStartTimeAndStatus(
            Long patientId, LocalDate date, LocalTime time, AppointmentStatus status);

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateAscStartTimeAsc(Long doctorId);

    List<Appointment> findAllByOrderByAppointmentDateDescStartTimeDesc();

    long countByStatus(AppointmentStatus status);
}
