<?php

namespace App\Filament\Resources\TestScriptResource\Pages;

use App\Filament\Resources\TestScriptResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewTestScript extends ViewRecord
{
    protected static string $resource = TestScriptResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\Action::make('Download')
                ->icon('heroicon-o-arrow-down-tray')
                ->url(fn (): string => $this->record->js_file_url)
                ->openUrlInNewTab()
                ->visible(fn (): bool => ! empty($this->record->js_file_path)),
        ];
    }
}
