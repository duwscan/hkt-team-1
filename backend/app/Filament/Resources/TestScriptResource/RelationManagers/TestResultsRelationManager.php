<?php

namespace App\Filament\Resources\TestScriptResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class TestResultsRelationManager extends RelationManager
{
    protected static string $relationship = 'testResults';

    protected static ?string $recordTitleAttribute = 'id';

    protected static ?string $title = 'Test Results';

    protected static ?string $navigationLabel = 'Test Results';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'running' => 'Running',
                        'passed' => 'Passed',
                        'failed' => 'Failed',
                        'skipped' => 'Skipped',
                    ])
                    ->required()
                    ->default('pending'),
                Forms\Components\Textarea::make('execution_data')
                    ->label('Execution Data (JSON)')
                    ->maxLength(65535)
                    ->columnSpanFull()
                    ->helperText('Enter execution data in JSON format'),
                Forms\Components\DateTimePicker::make('started_at')
                    ->label('Started At'),
                Forms\Components\DateTimePicker::make('completed_at')
                    ->label('Completed At'),
                Forms\Components\TextInput::make('error_message')
                    ->maxLength(255)
                    ->helperText('Error message if test failed'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                Tables\Columns\TextColumn::make('status')
                    ->searchable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'passed' => 'success',
                        'failed' => 'danger',
                        'running' => 'warning',
                        'pending' => 'gray',
                        'skipped' => 'info',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('started_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Started'),
                Tables\Columns\TextColumn::make('completed_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Completed'),
                Tables\Columns\TextColumn::make('execution_data')
                    ->limit(30)
                    ->searchable()
                    ->label('Data'),
                Tables\Columns\TextColumn::make('error_message')
                    ->limit(50)
                    ->searchable()
                    ->label('Error'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'running' => 'Running',
                        'passed' => 'Passed',
                        'failed' => 'Failed',
                        'skipped' => 'Skipped',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add New Test Result')
                    ->icon('heroicon-o-plus')
                    ->color('success')
                    ->mutateFormDataUsing(function (array $data): array {
                        $data['test_script_id'] = $this->getOwnerRecord()->id;
                        $data['project_id'] = $this->getOwnerRecord()->project_id;
                        $data['screen_id'] = $this->getOwnerRecord()->screen_id;

                        return $data;
                    }),
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
            ])
            ->emptyStateHeading('No test results found')
            ->emptyStateDescription('Create your first test result for this test script to get started.')
            ->emptyStateIcon('heroicon-o-clipboard-document-list')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->label('Create test result')
                    ->icon('heroicon-o-plus')
                    ->color('primary'),
            ]);
    }
}
