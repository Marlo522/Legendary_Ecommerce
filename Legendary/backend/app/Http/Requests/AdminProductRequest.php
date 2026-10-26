<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'category_id' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:10000'],
            'material' => ['nullable', 'string', 'max:255'],
            'care_instructions' => ['nullable', 'string', 'max:5000'],
            'base_price' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lte:base_price', 'decimal:0,2'],
            'status' => ['required', Rule::in(['active', 'draft', 'archived'])],
            'is_featured' => ['required', 'boolean'],
            'is_new_arrival' => ['required', 'boolean'],
            'updated_at' => [$this->isMethod('POST') ? 'nullable' : 'required', 'date'],
        ];
    }
}
