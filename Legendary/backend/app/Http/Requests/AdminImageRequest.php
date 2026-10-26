<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'alt_text' => ['required', 'string', 'max:255'],
            'display_order' => ['required', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
