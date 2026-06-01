<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PoleResource;
use App\Models\Category;
use App\Models\Pole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PoleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PoleResource::collection(Pole::with('categories')->orderBy('id')->get());
    }

    public function categories(Request $request): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->with('pole')
            ->when($request->filled('pole'), fn ($q) => $q->whereHas('pole', fn ($p) => $p->where('slug', $request->string('pole'))))
            ->orderBy('label')
            ->get();

        return CategoryResource::collection($categories);
    }
}
