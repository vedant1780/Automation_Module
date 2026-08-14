package com.example.hrm.payroll.controller;

import com.example.hrm.payroll.entity.EmployeeSalary;
import com.example.hrm.payroll.entity.SalaryStructure;
import com.example.hrm.payroll.repository.EmployeeSalaryRepository;
import com.example.hrm.payroll.repository.SalaryStructureRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary-structures")
public class SalaryController {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;

    public SalaryController(
            SalaryStructureRepository salaryStructureRepository,
            EmployeeSalaryRepository employeeSalaryRepository) {

        this.salaryStructureRepository =
                salaryStructureRepository;

        this.employeeSalaryRepository =
                employeeSalaryRepository;
    }



    @PostMapping
    public SalaryStructure create(
            @RequestBody SalaryStructure salaryStructure) {

        return salaryStructureRepository.save(
                salaryStructure
        );
    }



    @GetMapping
    public List<SalaryStructure> getAll() {

        return salaryStructureRepository.findAll();
    }


    @GetMapping("/{id}")
    public SalaryStructure getById(
            @PathVariable Long id) {

        return salaryStructureRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Salary structure not found"
                        ));
    }

    @PutMapping("/{id}")
    public SalaryStructure update(
            @PathVariable Long id,
            @RequestBody SalaryStructure updated) {

        SalaryStructure existing =
                salaryStructureRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                ));

        existing.setName(
                updated.getName()
        );

        existing.setBasicSalary(
                updated.getBasicSalary()
        );

        existing.setHra(
                updated.getHra()
        );

        existing.setSpecialAllowance(
                updated.getSpecialAllowance()
        );

        existing.setEffectiveFrom(
                updated.getEffectiveFrom()
        );

        existing.setEffectiveTo(
                updated.getEffectiveTo()
        );

        return salaryStructureRepository.save(
                existing
        );
    }


    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteSalaryStructure(
            @PathVariable Long id) {



        SalaryStructure salaryStructure =
                salaryStructureRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                ));


        List<EmployeeSalary> assignments =
                employeeSalaryRepository
                        .findBySalaryStructureId(id);



        if (!assignments.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Cannot delete salary structure. " +
                                    "It is currently assigned to " +
                                    assignments.size() +
                                    " employee(s)."
                    );
        }


   
        salaryStructureRepository.delete(
                salaryStructure
        );


        return ResponseEntity.ok(
                "Salary structure deleted successfully"
        );
    }
}
