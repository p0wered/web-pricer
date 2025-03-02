<?php

namespace App\Console\Commands;

use App\Models\MainProduct;
use App\Models\SpecialProduct;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ImportExcelData extends Command
{
    protected $signature = 'import:excel {filename=test.xlsx : Название файла в директории storage}';
    protected $description = 'Импорт данных из Excel файла в базу данных';
    const BATCH_SIZE = 5000;

    public function handle()
    {
        $filename = $this->argument('filename');
        $path = storage_path($filename);

        if (!file_exists($path)) {
            $this->error("Файл {$path} не найден!");
            return 1;
        }

        $this->info("Начинаем импорт данных из файла: {$path}");

        try {
            $spreadsheet = IOFactory::load($path);

            if ($this->confirm('Очистить существующие данные перед импортом?', true)) {
                MainProduct::truncate();
                SpecialProduct::truncate();
                $this->info('Таблицы очищены');
            }

            $sheetNames = $spreadsheet->getSheetNames();
            $totalSheets = count($sheetNames);

            $this->info("Найдено {$totalSheets} листов");
            $bar = $this->output->createProgressBar($totalSheets);

            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $mainProductsData = [];
            $specialProductsData = [];
            $mainProductsCount = 0;
            $specialProductsCount = 0;

            foreach ($sheetNames as $index => $sheetName) {
                if (strtolower($sheetName) === 'request' || strtolower($sheetName) === 'suppliers') {
                    $bar->advance();
                    continue;
                }

                $sheet = $spreadsheet->getSheetByName($sheetName);
                $rows = $sheet->toArray();

                if (count($rows) > 0) {
                    array_splice($rows, 0, 2);
                }

                $isSpecial = str_starts_with($sheetName, '>');
                $targetSheet = $isSpecial ? substr($sheetName, 1) : $sheetName;

                foreach ($rows as $row) {
                    if (empty($row[0])) continue;

                    $product = [
                        'name' => $row[0] ?? '',
                        'code' => $row[1] ?? null,
                        'quantity' => is_numeric($row[2] ?? '') ? (float)$row[2] : null,
                        'price' => is_numeric($row[3] ?? '') ? (float)$row[3] : null,
                        'description' => $row[4] ?? null,
                        'sheet_name' => $targetSheet,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    if ($isSpecial) {
                        $specialProductsData[] = $product;
                        $specialProductsCount++;
                    } else {
                        $mainProductsData[] = $product;
                        $mainProductsCount++;
                    }

                    if (count($mainProductsData) >= self::BATCH_SIZE) {
                        MainProduct::insert($mainProductsData);
                        $mainProductsData = [];
                    }

                    if (count($specialProductsData) >= self::BATCH_SIZE) {
                        SpecialProduct::insert($specialProductsData);
                        $specialProductsData = [];
                    }
                }

                $bar->advance();
            }

            if (!empty($mainProductsData)) {
                MainProduct::insert($mainProductsData);
            }

            if (!empty($specialProductsData)) {
                SpecialProduct::insert($specialProductsData);
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            $bar->finish();
            $this->newLine(2);

            $this->info("Импорт завершен успешно!");
            $this->info("Импортировано {$mainProductsCount} записей в основную таблицу");
            $this->info("Импортировано {$specialProductsCount} записей в специальную таблицу");

            return 0;
        } catch (\Exception $e) {
            $this->error("Ошибка при импорте данных: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
