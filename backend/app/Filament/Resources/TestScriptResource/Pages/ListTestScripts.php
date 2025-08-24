<?php

namespace App\Filament\Resources\TestScriptResource\Pages;

use App\Filament\Resources\TestScriptResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTestScripts extends ListRecords
{
    protected static string $resource = TestScriptResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
