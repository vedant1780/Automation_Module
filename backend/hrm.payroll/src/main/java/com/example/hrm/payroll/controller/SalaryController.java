package com.example.hrm.payroll.controller;
import com.example.hrm.payroll.entity.SalaryStructure;
import com.example.hrm.payroll.repository.SalaryStructureRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary-structures")
public class SalaryController {

    private final SalaryStructureRepository repository;

    public SalaryController(SalaryStructureRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public SalaryStructure create(
            @RequestBody SalaryStructure salaryStructure) {

        return repository.save(salaryStructure);
    }

    @GetMapping
    public List<SalaryStructure> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public SalaryStructure getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Salary structure not found"));
    }

    @PutMapping("/{id}")
    public SalaryStructure update(
            @PathVariable Long id,
            @RequestBody SalaryStructure updated) {

        SalaryStructure existing = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Salary structure not found"));

        existing.setName(updated.getName());
        existing.setBasicSalary(updated.getBasicSalary());
        existing.setHra(updated.getHra());
        existing.setSpecialAllowance(updated.getSpecialAllowance());
        existing.setEffectiveFrom(updated.getEffectiveFrom());
        existing.setEffectiveTo(updated.getEffectiveTo());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        repository.deleteById(id);
    }
}