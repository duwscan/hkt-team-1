<x-filament-panels::page>
    <div class="space-y-6">
        {{ $this->infolist }}

        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Screens</h3>
                <p class="mt-1 text-sm text-gray-500">Screens belonging to this project</p>
            </div>
            <div class="p-6">
                {{ $this->table }}
            </div>
        </div>
    </div>
</x-filament-panels::page>
