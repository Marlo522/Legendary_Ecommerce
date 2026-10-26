<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'color' => ['required', 'string', 'max:100'],
            'color_hex' => ['nullable', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'size' => ['nullable', 'string', 'max:20'],
            'sku' => ['required', 'string', 'max:100'],
            'price_override' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'low_stock_threshold' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
            'updated_at' => [$this->isMethod('POST') ? 'nullable' : 'required', 'date'],
        ];
    }
}
