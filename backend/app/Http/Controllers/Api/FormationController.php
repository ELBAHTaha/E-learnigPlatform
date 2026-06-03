<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFormationRequest;
use App\Http\Requests\UpdateFormationRequest;
use App\Http\Resources\FormationResource;
use App\Models\Category;
use App\Models\Formation;
use App\Models\Pole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class FormationController extends Controller
{
    /** Eager-load relations + approved enrollment count to avoid N+1. */
    private function baseQuery()
    {
        return Formation::query()
            ->with(['pole', 'category'])
            ->withCount(['enrollments as approved_enrollments_count' => fn ($q) => $q->where('status', 'approuvee')]);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $formations = $this->baseQuery()
            ->when($request->filled('pole'), fn ($q) => $q->whereHas('pole', fn ($p) => $p->where('slug', $request->string('pole'))))
            ->when($request->filled('subcategory'), fn ($q) => $q->whereHas('category', fn ($c) => $c->where('label', $request->string('subcategory'))))
            ->when($request->filled('level'), fn ($q) => $q->where('level', $request->string('level')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($w) => $w->where('title', 'like', $term)->orWhere('description', 'like', $term));
            })
            ->latest()
            ->get();

        return FormationResource::collection($formations);
    }

    public function show(string $formation): FormationResource
    {
        $model = $this->baseQuery()
            ->where(fn ($q) => $q->where('id', is_numeric($formation) ? (int) $formation : 0)->orWhere('slug', $formation))
            ->firstOrFail();

        return new FormationResource($model);
    }

    public function store(StoreFormationRequest $request): JsonResponse
    {
        $formation = Formation::create($this->mapAttributes($request->validated(), null));

        return (new FormationResource($this->baseQuery()->find($formation->id)))
            ->response()->setStatusCode(201);
    }

    public function update(UpdateFormationRequest $request, Formation $formation): FormationResource
    {
        $formation->update($this->mapAttributes($request->validated(), $formation));

        return new FormationResource($this->baseQuery()->find($formation->id));
    }

    public function destroy(Formation $formation): JsonResponse
    {
        $this->authorize('delete', $formation);
        $formation->delete();

        return response()->json(null, 204);
    }

    /** Translate camelCase input into column values, resolving pole & category. */
    private function mapAttributes(array $data, ?Formation $existing): array
    {
        $attrs = [];

        $direct = [
            'title' => 'title', 'level' => 'level', 'description' => 'description',
            'longDescription' => 'long_description', 'duration' => 'duration', 'price' => 'price',
            'currency' => 'currency', 'paymentOptions' => 'payment_options', 'schedule' => 'schedule',
            'formateurId' => 'formateur_id', 'capacity' => 'capacity', 'rating' => 'rating',
            'highlights' => 'highlights', 'documentsRequired' => 'documents_required',
            'modality' => 'modality', 'imageColor' => 'image_color', 'isActive' => 'is_active',
        ];
        foreach ($direct as $in => $col) {
            if (array_key_exists($in, $data)) {
                $attrs[$col] = $data[$in];
            }
        }

        $pole = null;
        if (array_key_exists('pole', $data)) {
            $pole = Pole::where('slug', $data['pole'])->first();
            $attrs['pole_id'] = $pole?->id;
        } elseif ($existing) {
            $pole = $existing->pole;
        }

        if (array_key_exists('subcategory', $data)) {
            $attrs['category_id'] = $pole && $data['subcategory']
                ? Category::where('pole_id', $pole->id)->where('label', $data['subcategory'])->value('id')
                : null;
        }

        if (array_key_exists('title', $data) && ! $existing) {
            $attrs['slug'] = $this->uniqueSlug($data['title']);
        }

        return $attrs;
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'formation';
        $slug = $base;
        $i = 2;
        while (Formation::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
