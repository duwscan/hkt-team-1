<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ScreenResource\Pages;
use App\Models\Screen;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ScreenResource extends Resource
{
    protected static ?string $model = Screen::class;

    protected static ?string $navigationIcon = 'heroicon-o-computer-desktop';

    protected static ?string $navigationLabel = 'Screens';

    protected static ?string $modelLabel = 'Screen';

    protected static ?string $pluralModelLabel = 'Screens';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('project_id')
                    ->relationship('project', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->label('Project')
                    ->default(function () {
                        // Auto-set project_id from URL parameter if available
                        return request()->get('project_id');
                    }),
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
                Tables\Columns\TextColumn::make('testScripts_count')
                    ->counts('testScripts')
                    ->label('Test Scripts')
                    ->badge()
                    ->color('info'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\Action::make('Add Test Script')
                    ->icon('heroicon-o-code-bracket')
                    ->color('warning')
                    ->form([
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
                    ])
                    ->action(function (array $data, Screen $record): void {
                        $data['project_id'] = $record->project_id;
                        $data['screen_id'] = $record->id;

                        // Store file path instead of content
                        $data['js_file_path'] = $data['js_file'];
                        unset($data['js_file']); // Remove the uploaded file data

                        $record->testScripts()->create($data);

                        $this->notify('success', 'Test Script created successfully!');
                        $this->refreshTable();
                    }),
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
            \App\Filament\Resources\ScreenResource\RelationManagers\TestScriptsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListScreens::route('/'),
            'create' => Pages\CreateScreen::route('/create'),
            'edit' => Pages\EditScreen::route('/{record}/edit'),
            'view' => Pages\ViewScreen::route('/{record}'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['project', 'testScripts']);
    }
}
