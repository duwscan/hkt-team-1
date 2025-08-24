<?php

namespace App\Filament\Resources\TestScriptResource\Pages;

use App\Filament\Resources\TestScriptResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTestScript extends CreateRecord
{
    protected static string $resource = TestScriptResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // If project_id is passed from URL parameter, use it
        if (request()->has('project_id')) {
            $data['project_id'] = request()->get('project_id');
        }

        // Store file path instead of content
        if (isset($data['js_file'])) {
            $data['js_file_path'] = $data['js_file'];
            unset($data['js_file']);
        }

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        // If we came from a project detail page, redirect back there
        if (request()->has('project_id')) {
            return route('filament.admin.resources.projects.view', request()->get('project_id'));
        }

        return $this->getResource()::getUrl('index');
    }
}
