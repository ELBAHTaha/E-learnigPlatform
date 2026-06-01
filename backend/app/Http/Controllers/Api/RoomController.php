<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoomController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Room::class);

        return RoomResource::collection(Room::orderBy('name')->get());
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $room = Room::create($request->toAttributes());

        return (new RoomResource($room))->response()->setStatusCode(201);
    }

    public function update(UpdateRoomRequest $request, Room $room): RoomResource
    {
        $room->update($request->toAttributes());

        return new RoomResource($room);
    }

    public function destroy(Room $room): JsonResponse
    {
        $this->authorize('delete', $room);
        $room->delete();

        return response()->json(null, 204);
    }
}
