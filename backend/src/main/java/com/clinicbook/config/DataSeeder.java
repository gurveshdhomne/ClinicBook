package com.clinicbook.config;

import com.clinicbook.model.Doctor;
import com.clinicbook.model.Role;
import com.clinicbook.model.User;
import com.clinicbook.repository.DoctorRepository;
import com.clinicbook.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

/** Adds demo accounts and doctors the first time the app starts with an empty database. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final DoctorRepository doctors;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, DoctorRepository doctors, PasswordEncoder encoder) {
        this.users = users;
        this.doctors = doctors;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;

        users.save(new User("Clinic Admin", "admin@clinicbook.in", encoder.encode("Admin@123"), null, Role.ADMIN));
        users.save(new User("Riya Patil", "patient@clinicbook.in", encoder.encode("Patient@123"), "9876543210", Role.PATIENT));

        doctor("Dr. Ananya Sharma", "ananya.sharma@clinicbook.in", "Cardiologist", 14, 800,
                "Treats heart rhythm problems, high blood pressure and chest pain. Runs a heart-health clinic for adults over 40.",
                "09:00", "13:00", 30);
        doctor("Dr. Rohan Deshmukh", "rohan.deshmukh@clinicbook.in", "Orthopedic", 11, 700,
                "Focuses on joint pain, sports injuries and fracture recovery, with a preference for non-surgical treatment first.",
                "10:00", "16:00", 30);
        doctor("Dr. Priya Nair", "priya.nair@clinicbook.in", "Dermatologist", 8, 600,
                "Skin, hair and nail care, including acne, eczema and allergy-related rashes.",
                "11:00", "17:00", 20);
        doctor("Dr. Arjun Mehta", "arjun.mehta@clinicbook.in", "Pediatrician", 10, 500,
                "Child health from newborn checkups to teenage years, including vaccinations and growth tracking.",
                "09:30", "14:30", 20);
        doctor("Dr. Sneha Kulkarni", "sneha.kulkarni@clinicbook.in", "Neurologist", 12, 900,
                "Headache, migraine, epilepsy and nerve-related problems. Evening clinic for working patients.",
                "14:00", "19:00", 30);
        doctor("Dr. Imran Qureshi", "imran.qureshi@clinicbook.in", "General Physician", 6, 300,
                "First point of contact for fever, infections, diabetes follow-ups and general health checkups.",
                "08:00", "12:00", 20);
     // New doctors
        doctor("Dr. Kavita Joshi", "kavita.joshi@clinicbook.in", "Gynecologist", 15, 800,
                "Women's health, pregnancy care and routine checkups, with an unhurried approach to consultations.",
                "10:00", "15:00", 30);
        doctor("Dr. Vikram Singh", "vikram.singh@clinicbook.in", "Dentist", 9, 400,
                "General dentistry, root canal treatment and cleaning, with a gentle approach for nervous patients.",
                "10:00", "18:00", 30);
        doctor("Dr. Meera Iyer", "meera.iyer@clinicbook.in", "ENT Specialist", 7, 500,
                "Ear, nose and throat care, including sinus problems, hearing issues and throat infections.",
                "09:00", "13:00", 20);
        doctor("Dr. Farah Khan", "farah.khan@clinicbook.in", "Ophthalmologist", 13, 600,
                "Eye checkups, vision correction and treatment of common eye infections and eye strain.",
                "11:00", "16:00", 20);
        doctor("Dr. Nikhil Bhosale", "nikhil.bhosale@clinicbook.in", "Gastroenterologist", 10, 700,
                "Digestive problems such as acidity, stomach pain, liver and bowel conditions.",
                "15:00", "19:00", 30);
        doctor("Dr. Pooja Agarwal", "pooja.agarwal@clinicbook.in", "Endocrinologist", 11, 750,
                "Diabetes, thyroid and hormone-related conditions, with long-term follow-up plans.",
                "09:00", "13:00", 30);
    }

    private void doctor(String name, String email, String specialization, int years, int fee,
                        String bio, String start, String end, int slotMinutes) {
        User user = users.save(new User(name, email, encoder.encode("Doctor@123"), null, Role.DOCTOR));
        doctors.save(new Doctor(user, specialization, years, fee, bio,
                LocalTime.parse(start), LocalTime.parse(end), slotMinutes));
    }
}
