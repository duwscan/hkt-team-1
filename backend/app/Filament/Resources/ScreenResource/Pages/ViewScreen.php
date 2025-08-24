<?php

namespace App\Filament\Resources\ScreenResource\Pages;

use App\Filament\Resources\ScreenResource;
use App\Filament\Resources\ScreenResource\RelationManagers;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewScreen extends ViewRecord
{
    protected static string $resource = ScreenResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }

    protected function getRelationManagers(): array
    {
        return [
            RelationManagers\TestScriptsRelationManager::class,
        ];
    }
}