<?php

namespace App\Filament\Resources\TestScriptResource\Pages;

use App\Filament\Resources\TestScriptResource;
use App\Filament\Resources\TestScriptResource\RelationManagers;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewTestScript extends ViewRecord
{
    protected static string $resource = TestScriptResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }

    protected function getRelationManagers(): array
    {
        return [
            RelationManagers\TestResultsRelationManager::class,
        ];
    }
}