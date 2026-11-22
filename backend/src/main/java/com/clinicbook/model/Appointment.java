package com.clinicbook.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private User patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.BOOKED;

    @Column(length = 300)
    private String reason;

    private LocalDateTime createdAt = LocalDateTime.now();

    protected Appointment() {}

    public Appointment(User patient, Doctor doctor, LocalDate appointmentDate, LocalTime startTime, String reason) {
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.startTime = startTime;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public User getPatient() { return patient; }
    public Doctor getDoctor() { return doctor; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public LocalTime getStartTime() { return startTime; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public String getReason() { return reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
