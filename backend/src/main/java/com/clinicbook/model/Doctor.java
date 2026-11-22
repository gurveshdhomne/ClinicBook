package com.clinicbook.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private String specialization;

    private int experienceYears;
    private int consultationFee;

    @Column(length = 600)
    private String bio;

    private LocalTime workStart;
    private LocalTime workEnd;
    private int slotMinutes;
    private boolean active = true;

    protected Doctor() {}

    public Doctor(User user, String specialization, int experienceYears, int consultationFee,
                  String bio, LocalTime workStart, LocalTime workEnd, int slotMinutes) {
        this.user = user;
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.consultationFee = consultationFee;
        this.bio = bio;
        this.workStart = workStart;
        this.workEnd = workEnd;
        this.slotMinutes = slotMinutes;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getSpecialization() { return specialization; }
    public int getExperienceYears() { return experienceYears; }
    public int getConsultationFee() { return consultationFee; }
    public String getBio() { return bio; }
    public LocalTime getWorkStart() { return workStart; }
    public LocalTime getWorkEnd() { return workEnd; }
    public int getSlotMinutes() { return slotMinutes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
