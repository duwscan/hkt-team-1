<?php

namespace App\Filament\Resources\ScreenResource\Pages;

use App\Filament\Resources\ScreenResource;
use Filament\Resources\Pages\CreateRecord;

class CreateScreen extends CreateRecord
{
    protected static string $resource = ScreenResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // If project_id is passed from URL parameter, use it
        if (request()->has('project_id')) {
            $data['project_id'] = request()->get('project_id');
        }

        return $data;
    }

    protected function getFormData(): array
    {
        $data = parent::getFormData();

        // Auto-set project_id from URL parameter if available
        if (request()->has('project_id')) {
            $data['project_id'] = request()->get('project_id');
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
