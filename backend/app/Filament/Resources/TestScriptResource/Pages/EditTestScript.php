<?php

namespace App\Filament\Resources\TestScriptResource\Pages;

use App\Filament\Resources\TestScriptResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTestScript extends EditRecord
{
    protected static string $resource = TestScriptResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}