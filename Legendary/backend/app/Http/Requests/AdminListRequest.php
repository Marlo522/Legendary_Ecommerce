<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class AdminListRequest extends PaginationRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'search' => ['nullable', 'string', 'max:80', 'regex:/^[\\pL\\pN\\s@.\x2D]*$/u'],
            'status' => ['nullable', Rule::in($this->routeIs('admin.products')
                ? ['active', 'draft', 'archived']
                : ['pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled'])],
        ];
    }

    public function filters(): array
    {
        $filters = [];
        if ($this->filled('status')) {
            $filters['status'] = 'eq.'.$this->validated('status');
        }
        if ($this->filled('search')) {
            $search = trim($this->validated('search'));
            if ($this->routeIs('admin.products')) {
                $filters['name'] = 'ilike.*'.$search.'*';
            } else {
                $filters['or'] = '(order_number.ilike.*'.$search.'*,guest_name.ilike.*'.$search.'*,guest_email.ilike.*'.$search.'*)';
            }
        }

        return $filters;
    }
}
