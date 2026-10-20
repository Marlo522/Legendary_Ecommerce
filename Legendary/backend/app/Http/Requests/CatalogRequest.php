<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class CatalogRequest extends PaginationRequest
{
    public function rules(): array
    {
        return [...parent::rules(),
            'q' => ['sometimes', 'nullable', 'string', 'max:120'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_-]+$/'],
            'color' => ['sometimes', 'nullable', 'string', 'max:100'],
            'size' => ['sometimes', 'nullable', 'string', 'max:20'],
            'min_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'max_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999999.99', ...($this->filled('min_price') ? ['gte:min_price'] : [])],
            'collection' => ['sometimes', 'nullable', Rule::in(['featured', 'new-arrivals'])],
            'availability' => ['sometimes', 'nullable', Rule::in(['in-stock', 'out-of-stock'])],
            'sort' => ['sometimes', Rule::in(['newest', 'price_asc', 'price_desc', 'popularity', 'name'])],
        ];
    }
}
