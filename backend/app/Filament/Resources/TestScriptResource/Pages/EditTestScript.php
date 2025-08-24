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

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Store file path instead of content
        if (isset($data['js_file'])) {
            $data['js_file_path'] = $data['js_file'];
            unset($data['js_file']);
        }

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
