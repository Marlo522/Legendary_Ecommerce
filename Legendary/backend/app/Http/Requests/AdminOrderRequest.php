<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_phone' => ['required', 'string', 'max:50'],
            'status' => ['required', Rule::in(['pending', 'confirmed', 'packed', 'shipped', 'completed', 'cancelled'])],
            'payment_method' => ['required', 'string', 'max:50'],
            'payment_status' => ['required', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'shipping_fee' => ['required', 'numeric', 'min:0', 'max:999999.99', 'decimal:0,2'],
            'discount_amount' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'shipping_address' => ['required', 'array:recipient_name,phone,address_line_1,address_line_2,city,province,postal_code,country'],
            'shipping_address.recipient_name' => ['required', 'string', 'max:255'],
            'shipping_address.phone' => ['required', 'string', 'max:50'],
            'shipping_address.address_line_1' => ['required', 'string', 'max:1000'],
            'shipping_address.address_line_2' => ['nullable', 'string', 'max:1000'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.province' => ['required', 'string', 'max:100'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'size:2'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*' => ['required', 'array:variant_id,quantity'],
            'items.*.variant_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'updated_at' => [$this->isMethod('POST') ? 'nullable' : 'required', 'date'],
        ];
    }
}
