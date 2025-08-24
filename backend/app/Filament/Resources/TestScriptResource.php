<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestScriptResource\Pages;
use App\Models\TestScript;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TestScriptResource extends Resource
{
    protected static ?string $model = TestScript::class;

    protected static ?string $navigationIcon = 'heroicon-o-code-bracket';

    protected static ?string $navigationGroup = 'Project Management';

    protected static bool $shouldRegisterNavigation = false;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Test Script Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Script Name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\FileUpload::make('file_path')
                            ->label('JavaScript File')
                            ->acceptedFileTypes(['application/javascript', 'text/javascript'])
                            ->required()
                            ->directory('test-scripts')
                            ->storeFileNamesIn('original_filename'),
                        Forms\Components\Select::make('project_id')
                            ->label('Project')
                            ->relationship('project', 'name')
                            ->required()
                            ->searchable()
                            ->reactive(),
                        Forms\Components\Select::make('screen_id')
                            ->label('Screen')
                            ->relationship('screen', 'name', function ($query, $get) {
                                $projectId = $get('project_id');
                                if ($projectId) {
                                    $query->where('project_id', $projectId);
                                }
                                return $query;
                            })
                            ->required()
                            ->searchable()
                            ->visible(fn ($get) => $get('project_id')),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Script Name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('project.name')
                    ->label('Project')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('screen.name')
                    ->label('Screen')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('test_results_count')
                    ->label('Test Results')
                    ->counts('testResults')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('project')
                    ->relationship('project', 'name')
                    ->label('Filter by Project'),
                Tables\Filters\SelectFilter::make('screen')
                    ->relationship('screen', 'name')
                    ->label('Filter by Screen'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            \App\Filament\Resources\TestScriptResource\RelationManagers\TestResultsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTestScripts::route('/'),
            'create' => Pages\CreateTestScript::route('/create'),
            'view' => Pages\ViewTestScript::route('/{record}'),
            'edit' => Pages\EditTestScript::route('/{record}/edit'),
        ];
    }
}