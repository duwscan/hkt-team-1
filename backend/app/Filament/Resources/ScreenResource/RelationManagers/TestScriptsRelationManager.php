<?php

namespace App\Filament\Resources\ScreenResource\RelationManagers;

use App\Models\TestScript;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class TestScriptsRelationManager extends RelationManager
{
    protected static string $relationship = 'testScripts';

    protected static ?string $recordTitleAttribute = 'name';

    protected static ?string $title = 'Test Scripts';

    protected static ?string $navigationLabel = 'Test Scripts';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
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

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
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
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add New Test Script')
                    ->icon('heroicon-o-plus')
                    ->color('success')
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['project_id'] = $this->getOwnerRecord()->project_id;
                        $data['screen_id'] = $this->getOwnerRecord()->id;

                        // Store file path instead of content
                        if (isset($data['js_file'])) {
                            $data['js_file_path'] = $data['js_file'];
                            unset($data['js_file']);
                        }

                        return $data;
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->url(fn (TestScript $record): string => route('filament.admin.resources.test-scripts.view', $record)),
                Tables\Actions\EditAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        // Store file path instead of content
                        if (isset($data['js_file'])) {
                            $data['js_file_path'] = $data['js_file'];
                            unset($data['js_file']);
                        }

                        return $data;
                    }),
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
            ])
            ->emptyStateHeading('No test scripts found')
            ->emptyStateDescription('Create your first test script for this screen to get started.')
            ->emptyStateIcon('heroicon-o-code-bracket')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->label('Create test script')
                    ->icon('heroicon-o-plus')
                    ->color('primary'),
            ]);
    }
}
