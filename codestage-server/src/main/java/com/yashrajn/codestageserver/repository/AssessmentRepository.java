package com.yashrajn.codestageserver.repository;


import com.yashrajn.codestageserver.models.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Integer> {
    List<Assessment> findByAdminId(String adminId);
}

