package com.smartfinance.service;

import com.smartfinance.domain.Category;
import com.smartfinance.domain.User;
import com.smartfinance.dto.CategoryRequestDto;
import com.smartfinance.dto.CategoryResponseDto;
import com.smartfinance.exception.BadRequestException;
import com.smartfinance.exception.ResourceNotFoundException;
import com.smartfinance.repository.CategoryRepository;
import com.smartfinance.repository.TransactionRepository;
import com.smartfinance.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getCategories() {
        User user = currentUserService.getCurrentUser();
        return categoryRepository.findAllByUserIdOrderByNameAsc(user.getId())
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto request) {
        User user = currentUserService.getCurrentUser();
        String name = request.name().trim();
        if (categoryRepository.existsByNameAndUserIdAndType(
            name, user.getId(), request.type()
        )) {
            throw new BadRequestException("A category with this name and type already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setType(request.type());
        category.setUser(user);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        User user = currentUserService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (transactionRepository.existsByCategoryIdAndUserId(id, user.getId())) {
            throw new BadRequestException("Cannot delete a category used by transactions");
        }
        categoryRepository.delete(category);
    }

    private CategoryResponseDto toResponse(Category category) {
        return new CategoryResponseDto(category.getId(), category.getName(), category.getType());
    }
}
