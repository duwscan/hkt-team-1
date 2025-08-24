<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use App\Models\Screen;
use Filament\Actions;
use Filament\Forms;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class DetailProject extends ViewRecord implements HasTable
{
    use InteractsWithTable;

    protected static string $resource = ProjectResource::class;

    protected static string $view = 'filament.resources.project-resource.pages.detail-project';

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Project Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('name')
                            ->label('Project Name')
                            ->size(Infolists\Components\TextEntry\TextEntrySize::Large)
                            ->weight('bold'),
                        Infolists\Components\TextEntry::make('description')
                            ->label('Description')
                            ->markdown()
                            ->columnSpanFull(),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Created At')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('updated_at')
                            ->label('Updated At')
                            ->dateTime(),
                    ])
                    ->columns(2),
                Infolists\Components\Section::make('Project Statistics')
                    ->schema([
                        Infolists\Components\TextEntry::make('screens_count')
                            ->state(fn (): int => $this->getRecord()->screens()->count())
                            ->label('Total Screens')
                            ->badge()
                            ->color('success'),
                        Infolists\Components\TextEntry::make('test_scripts_count')
                            ->state(fn (): int => $this->getRecord()->testScripts()->count())
                            ->label('Total Test Scripts')
                            ->badge()
                            ->color('info'),
                    ])
                    ->columns(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->query($this->getTableQuery())
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Screen Name'),
                Tables\Columns\TextColumn::make('domain')
                    ->searchable()
                    ->sortable()
                    ->label('Domain'),
                Tables\Columns\TextColumn::make('url_path')
                    ->searchable()
                    ->sortable()
                    ->label('URL Path'),
                Tables\Columns\TextColumn::make('description')
                    ->limit(50)
                    ->searchable()
                    ->label('Description'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Created At'),

            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->url(fn (Screen $record): string => route('filament.admin.resources.screens.view', $record)),
                Tables\Actions\EditAction::make()
                    ->url(fn (Screen $record): string => route('filament.admin.resources.screens.edit', $record)),

            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    protected function getTableQuery(): Builder
    {
        return $this->getRecord()->screens()->getQuery();
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make()
                ->url(fn (): string => route('filament.admin.resources.projects.edit', $this->getRecord())),
            Actions\Action::make('Add Screen')
                ->icon('heroicon-o-plus')
                ->color('success')
                ->label('Add New Screen')
                ->form([
                    Forms\Components\TextInput::make('name')
                        ->required()
                        ->maxLength(255)
                        ->label('Screen Name'),
                    Forms\Components\TextInput::make('domain')
                        ->required()
                        ->maxLength(255)
                        ->label('Domain'),
                    Forms\Components\TextInput::make('url_path')
                        ->required()
                        ->maxLength(255)
                        ->label('URL Path'),
                    Forms\Components\Textarea::make('description')
                        ->maxLength(65535)
                        ->columnSpanFull()
                        ->label('Description'),
                ])
                ->action(function (array $data): void {
                    $data['project_id'] = $this->getRecord()->id;
                    Screen::create($data);

                    // $this->notify('success', 'Screen created successfully!');
                    // $this->refreshTable();
                }),
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            // You can add widgets here if needed
        ];
    }
}
