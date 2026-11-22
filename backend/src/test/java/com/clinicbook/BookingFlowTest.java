package com.clinicbook;

import com.clinicbook.dto.Dtos.*;
import com.clinicbook.exception.ApiException;
import com.clinicbook.service.AppointmentService;
import com.clinicbook.service.AuthService;
import com.clinicbook.service.DoctorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:testdb")
class BookingFlowTest {

    @Autowired AppointmentService appointments;
    @Autowired DoctorService doctors;
    @Autowired AuthService auth;

    @Test
    void secondPatientCannotBookTheSameSlot() {
        DoctorResponse doctor = doctors.search(null, null, false).get(0);
        LocalDate day = LocalDate.now().plusDays(3);
        SlotResponse slot = doctors.slots(doctor.id(), day).stream()
                .filter(SlotResponse::available).findFirst().orElseThrow();
        BookingRequest request = new BookingRequest(doctor.id(), day, LocalTime.parse(slot.time()), "Checkup");

        appointments.book("patient@clinicbook.in", request);

        auth.register(new RegisterRequest("Second Patient", "second@test.in", "secret12", ""));
        ApiException ex = assertThrows(ApiException.class, () -> appointments.book("second@test.in", request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void cancelledSlotBecomesFreeAgain() {
        DoctorResponse doctor = doctors.search(null, null, false).get(1);
        LocalDate day = LocalDate.now().plusDays(4);
        SlotResponse slot = doctors.slots(doctor.id(), day).stream()
                .filter(SlotResponse::available).findFirst().orElseThrow();
        BookingRequest request = new BookingRequest(doctor.id(), day, LocalTime.parse(slot.time()), null);

        AppointmentResponse booked = appointments.book("patient@clinicbook.in", request);
        appointments.cancel(booked.id(), "patient@clinicbook.in", com.clinicbook.model.Role.PATIENT);

        assertTrue(doctors.slots(doctor.id(), day).stream()
                .anyMatch(s -> s.time().equals(slot.time()) && s.available()));
    }
}
