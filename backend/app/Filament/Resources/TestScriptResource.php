<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestScriptResource\Pages;
use App\Models\TestScript;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TestScriptResource extends Resource
{
    protected static ?string $model = TestScript::class;

    protected static ?string $navigationIcon = 'heroicon-o-code-bracket';

    protected static ?string $navigationLabel = 'Test Scripts';

    protected static ?string $modelLabel = 'Test Script';

    protected static ?string $pluralModelLabel = 'Test Scripts';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('project_id')
                    ->relationship('project', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->label('Project'),
                Forms\Components\Select::make('screen_id')
                    ->relationship('screen', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->label('Screen')
                    ->options(function (callable $get) {
                        $projectId = $get('project_id');
                        if ($projectId) {
                            return \App\Models\Screen::where('project_id', $projectId)
                                ->pluck('name', 'id');
                        }

                        return [];
                    })
                    ->reactive(),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->label('Test Script Name'),
                Forms\Components\FileUpload::make('js_file')
                    ->required()
                    ->label('JavaScript File')
                    ->acceptedFileTypes(['application/javascript', 'text/javascript', '.js'])
                    ->maxSize(10240) // 10MB max
                    ->helperText('Upload JavaScript file (.js) - Max 10MB')
                    ->directory('test-scripts')
                    ->preserveFilenames()
                    ->visibility('private'),
                Forms\Components\TextInput::make('version')
                    ->maxLength(255)
                    ->label('Version (optional)')
                    ->helperText('Leave empty for auto-versioning'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('project.name')
                    ->searchable()
                    ->sortable()
                    ->label('Project'),
                Tables\Columns\TextColumn::make('screen.name')
                    ->searchable()
                    ->sortable()
                    ->label('Screen'),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->label('Test Script Name'),
                Tables\Columns\TextColumn::make('version')
                    ->searchable()
                    ->sortable()
                    ->label('Version'),
                Tables\Columns\TextColumn::make('js_file_name')
                    ->label('File Name')
                    ->limit(30),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Created At'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('project_id')
                    ->label('Project')
                    ->options(\App\Models\Project::pluck('name', 'id')),
                Tables\Filters\SelectFilter::make('screen_id')
                    ->label('Screen')
                    ->options(\App\Models\Screen::pluck('name', 'id')),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\Action::make('Download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn (TestScript $record): string => $record->js_file_url)
                    ->openUrlInNewTab()
                    ->visible(fn (TestScript $record): bool => ! empty($record->js_file_path)),
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
            'edit' => Pages\EditTestScript::route('/{record}/edit'),
            'view' => Pages\ViewTestScript::route('/{record}'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with(['project', 'screen']);

        // Filter by project_id if provided in URL
        if (request()->has('project_id')) {
            $query->where('project_id', request()->get('project_id'));
        }

        return $query;
    }
}
