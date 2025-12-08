package com.yashrajn.codestageserver.repository;

import com.yashrajn.codestageserver.models.entity.CodeChange;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CodeChangeRepository extends JpaRepository<CodeChange, Long> {
}
